/* eslint-disable object-shorthand */
/* eslint-disable no-unneeded-ternary */
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const User = require('../../model/user');
const History = require('../../model/history');
const Plan = require('../../model/coinPlan');
const Setting = require('../../model/setting');
const Host = require('../../model/host');
const FlashCoin = require('../../model/flashCoin');
const VipPlanHistory = require('../../model/vipPlanHistory');
const VipPlan = require('../../model/vipPlan');
const VipFlashCoin = require('../../model/vipFlashCoin');
const AppWiseSetting = require('../../model/appWiseSetting');

// get all user for admin penal
exports.index = async (req, res) => {
  try {
    const start = req?.query?.start ? parseInt(req?.query?.start) : 1;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit) : 20;
    let query;
    let appname = { _id: { $ne: null } };
    let sort = { createdAt: -1 };

    if (req?.query?.search != 'all') {
      query = {
        $or: [
          { name: { $regex: req?.query?.search, $options: 'i' } },
          { gender: { $regex: req?.query?.search, $options: 'i' } },
          { country: { $regex: req?.query?.search, $options: 'i' } },
          { email: { $regex: req?.query?.search, $options: 'i' } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$uniqueId' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
        ],
      };
    } else {
      query = {};
    }

    switch (req?.query?.sort) {
      case 'coin':
        sort = { coin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'purchageCoin':
        sort = { purchageCoin: parseInt(req.query?.sortType) || 1 };
        break;
      default:
        break;
    }

    if (req?.query?.appName !== 'ALL') {
      appname = {
        'packageName.appName': req?.query?.appName,
      };
    }
    const user = await User.aggregate([
      {
        $match: { ...query, isDelete: false },
      },
      {
        $sort: sort,
      },
      {
        $lookup: {
          from: 'appwisesettings',
          as: 'packageName',
          let: { packageName: '$packageName' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$packageName', '$packageName'],
                },
              },
            },
            {
              $project: {
                appName: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$packageName',
          // preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: appname,
      },
      {
        $facet: {
          user: [
            { $skip: (start - 1) * limit }, // how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
          ],
        },
      },
    ]);

    // const total = await User.find({ isDelete: false }).countDocuments();

    return res.status(200).send({
      status: true,
      message: 'success!!',
      total:
        user[0]?.pageInfo[0]?.totalRecord > 0
          ? user[0]?.pageInfo[0]?.totalRecord
          : 0,
      user: user[0]?.user,
    });
  } catch (error) {
    console.log(error);
  }
};

// login or signup user
exports.store = async (req, res) => {
  try {
    console.log('loginnnnnnnnnnnnnnnnnnnnnnnnn', req?.body);
    if (!req?.body?.name || !req?.body?.fcmToken || !req?.body?.identity) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    let userQuery;
    if (req?.body?.loginType == 0 || req?.body?.loginType == 1) {
      if (!req?.body?.email) {
        return res
          .status(200)
          .json({ status: false, message: 'Email is required !' });
      }

      userQuery = await User.findOne({
        email: req?.body?.email,
        packageName: req?.body?.packageName,
      });
    } else if (req?.body?.loginType == 2) {
      if (!req?.body?.identity) {
        return res
          .status(200)
          .json({ status: false, message: 'identity is required !' });
      }
      userQuery = await User.findOne({
        identity: req?.body?.identity,
        packageName: req?.body?.packageName,
      });
    }

    const users = userQuery;
    if (users) {
      if (users.isBlock) {
        return res
          .status(200)
          .json({ status: false, message: 'You are block by admin!' });
      }
      users.fcmToken = req?.body.fcmToken;

      await users.save();
      // const user_ = await userFunction_(users, req);
      return res.status(200).send({
        status: true,
        message: 'login successfully !!',
        user: users,
      });
    }
    const newUser = new User();
    const setting = await AppWiseSetting.findOne({
      packageName: req?.body?.packageName,
    });
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    for (let i = 0; i < 8; i += 1) {
      referralCode += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    newUser.referralCode = referralCode;
    newUser.uniqueId = await Promise.resolve(generateUsername());

    const Bonus = setting
      ? Math.floor(
          Math.random() * (setting.maxLoginBonus - setting?.loginBonus) +
            setting?.loginBonus
        )
      : 0;

    newUser.coin += Bonus;
    const user = await userFunction_(newUser, req);

    const history = new History();
    history.userId = user._id;
    history.uCoin = Bonus;
    history.type = 4;
    history.date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    await history.save();
    return res.status(200).send({
      status: true,
      message: 'signup successfully',
      user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'internal server error' || error });
  }
};

const userFunction_ = async (user, data_) => {
  const data = data_.body;
  user.name = data.name ? data.name : user.name;
  user.email = data.email ? data.email : user.email;
  user.packageName = data?.packageName;
  user.loginType = data.loginType;
  user.fcmToken = data.fcmToken;
  user.age = data.age ? data.age : user.age;
  user.identity = data.identity ? data.identity : user.identity;
  user.image = `${process?.env?.BASE_URL}storage/female.png`;

  user.country = data.country ? data.country : user.country;
  user.lastLoginDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
  });

  await user.save();

  const user_ = await User.findById(user._id);

  return user_;
};

// generate unique Id for user
const generateUsername = async () => {
  const random = () =>
    // eslint-disable-next-line implicit-arrow-linebreak
    Math.floor(Math.random() * 90000000) + 10000000;

  let uniqueId = random().toString().padStart(8, '0');

  let user = await User.findOne({ uniqueId });
  while (user) {
    uniqueId = random().toString().padStart(8, '0');
    user = await User.findOne({ uniqueId });
  }

  return uniqueId;
};

// update user
exports.updateUser = async (req, res) => {
  try {
    if (!req?.params?.userId) {
      return res.status(200).send({ status: false, message: 'Id is require' });
    }

    const user = await User.findById(req?.params?.userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    user.name = req?.body?.name ? req?.body?.name : user.name;
    user.age = req?.body?.age ? req?.body?.age : user.age;
    user.gender = req?.body?.gender ? req?.body?.gender : user.gender;

    // if (req.file) {
    //   const image_ = user.image.split('storage/');
    //   if (image_[1] !== 'male.png' && image_[1] !== 'female.png') {
    //     if (fs.existsSync(`storage/${image_[1]}`)) {
    //       fs.unlinkSync(`storage/${image_[1]}`);
    //     }
    //   }
    //   user.image = process?.env?.BASE_URL + req?.file?.path;
    // } else if (req?.body?.gender === 'male') {
    //   user.image = `${process?.env?.BASE_URL}storage/male.png`;
    // } else {
    //   user.image = `${process?.env?.BASE_URL}storage/female.png`;
    // }

    await user.save();

    return res.status(200).send({ status: true, message: ' success', user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req?.query?.userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'User does not Found !!' });
    }
    let isVip;

    const vipPlan = await VipPlanHistory.findOne({
      userId: user._id,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
    if (vipPlan && vipPlan.expireDate > moment().toISOString()) {
      isVip = true;
    } else {
      isVip = false;
    }
    return res.status(200).send({
      status: true,
      message: 'success!!',
      user: { ...user.toObject(), isVip: isVip },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const user = await User.findById(req?.query?.userId);

    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    const image = user.image.split('storage');
    if (image) {
      if (fs.existsSync(`storage${image[1]}`)) {
        fs.unlinkSync(`storage${image[1]}`);
      }
    }

    user.email = null;
    user.identity = null;
    await user.save();

    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.addLessCoin = async (req, res) => {
  try {
    const { userId, coin } = req.body;

    if (!userId || !coin) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details ' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    user.coin = coin;

    await user.save();

    const userHistory = new History();

    userHistory.userId = user._id;
    userHistory.uCoin = coin;
    userHistory.type = 5;
    userHistory.date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    await userHistory.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', response: user });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: true, message: 'Internal server error' });
  }
};

// block unblock by admin
exports.blockUnblockByAdmin = async (req, res) => {
  try {
    if (!req.params.userId) {
      return res
        .status(200)
        .json({ status: false, message: 'user Id is required !' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'user does not exists !' });
    }

    user.isBlock = !user.isBlock;

    await user.save();

    return res.status(200).json({
      status: true,
      message: 'success',
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

exports.purchagePlan = async (req, res) => {
  try {
    const { userId, planId, type, paymentGateway } = req.body;

    if (!userId || !planId || !type) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    let plan,
      historyType,
      isVip = false;
    switch (type) {
      case 'coinPlan':
        plan = await Plan.findById(req.body.planId);
        historyType = 2;
        if (!plan) {
          return res
            .status(200)
            .json({ status: false, message: 'Plan does not Exist!', user: {} });
        }
        break;
      case 'flashCoin':
        plan = await FlashCoin.findById(req.body.planId);
        historyType = 7;
        if (!plan) {
          return res
            .status(200)
            .json({ status: false, message: 'Plan does not Exist!', user: {} });
        }
        break;
      case 'vipPlan':
        plan = await VipPlan.findById(req.body.planId);
        historyType = 10;
        if (!plan) {
          return res
            .status(200)
            .send({ status: false, message: 'vipPlan not exists', user: {} });
        }
        const validDate = moment().add(plan.validity, `${plan.validityType}`);
        const purchaseHistory = new VipPlanHistory();
        purchaseHistory.userId = user._id;
        purchaseHistory.planId = plan._id;
        purchaseHistory.expireDate = validDate.toISOString();
        await purchaseHistory.save();
        isVip = true;
        break;
      case 'vipFlashCoin':
        plan = await VipFlashCoin.findById(req.body.planId);
        historyType = 11;
        if (!plan) {
          return res.status(200).send({
            status: false,
            message: 'vipFlashCoin not exists',
            user: {},
          });
        }
        const vipFlashValidDate = moment().add(
          plan.validity,
          `${plan.validityType}`
        );
        const vipFlashPurchaseHistory = new VipPlanHistory();
        vipFlashPurchaseHistory.userId = user._id;
        vipFlashPurchaseHistory.vipFlashCoinId = plan._id;
        vipFlashPurchaseHistory.expireDate = vipFlashValidDate.toISOString();
        await vipFlashPurchaseHistory.save();
        isVip = true;
        break;
    }

    if (type == 'coinPlan' || type == 'flashCoin') {
      user.coin += plan.coin;
      user.purchageCoin += plan.coin;
      await user.save();
    }

    const planCoin = await plan.coin

    const userHistory = new History();
    userHistory.userId = user._id;
    userHistory.planId = plan?._id;
    userHistory.paymentGateway = paymentGateway ? paymentGateway : null;
    userHistory.uCoin = plan.coin ? plan.coin : 0;
    userHistory.date = new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
    userHistory.type = historyType;
    await userHistory.save();

    return res.status(200).send({
      status: true,
      message: 'success!!',
      planCoin,
      user: { ...user.toObject(), isVip: true },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

// for user raferral bonus
exports.userReffrleBonus = async (req, res) => {
  try {
    const { userId, referralCode, packageName } = req?.body;

    if (!userId || !referralCode) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    // eslint-disable-next-line object-shorthand
    const reffreleUser = await User.findOne({ referralCode: referralCode });

    if (!reffreleUser) {
      return res.status(200).send({
        status: false,
        message: 'ReferralCode has been wrong given by the user!',
      });
    }

    const setting = await AppWiseSetting.findOne({ packageName: packageName });

    if (user.isReferral) {
      return res.status(200).send({
        status: false,
        message: 'User already use referral code',
        user: {},
      });
    }

    user.isReferral = true;
    user.coin += setting ? setting.referralBonus : 0;

    await user.save();

    reffreleUser.coin += setting ? setting.referralBonus : 0;
    reffreleUser.referralCount += 1;

    await reffreleUser.save();

    const reffrelHistory = new History();

    reffrelHistory.userId = reffreleUser._id;
    reffrelHistory.uCoin = setting ? setting.referralBonus : 0; // reffrlebonus coin for reffreleuser
    reffrelHistory.otherUserId = user._id; // reffrleuser id for reffrlebonus
    reffrelHistory.type = 6;
    reffrelHistory.date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    await reffrelHistory.save();

    const reffrelHistoryOfUser = new History();

    reffrelHistoryOfUser.userId = user._id;
    reffrelHistoryOfUser.uCoin = setting ? setting.referralBonus : 0;
    reffrelHistoryOfUser.otherUserId = reffreleUser._id;
    reffrelHistoryOfUser.type = 6;
    reffrelHistoryOfUser.date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    await reffrelHistoryOfUser.save();

    return res.status(200).send({ status: true, message: 'success!!', user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// for update fcm token user or host
exports.updateFCm = async (req, res) => {
  try {
    if (!req?.body?.userId || !req?.body?.fcmToken) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const user = await User.findOne({ _id: req?.body?.userId });

    if (!user) {
      const host = await Host.findOne({ _id: req?.body?.userId });
      if (!host) {
        return res
          .status(200)
          .send({ status: false, message: 'data not found' });
      }

      host.fcm_token = req?.body?.fcmToken;

      await host.save();

      return res.status(200).send({ status: false, message: 'success!!' });
    }
    user.fcmToken = req?.body?.fcmToken;

    await user.save();

    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// check user is online or not
exports.checkUserIsOnline = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);

    if (!user) {
      return res.status(200).json({
        status: false,
        message: 'User Not Found !',
      });
    }
    return res.status(200).json({
      status: true,
      message: 'Successful !',
      online: user.isOnline,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: error.message || 'Sever Error' });
  }
};
