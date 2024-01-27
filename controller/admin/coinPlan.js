/* eslint-disable prefer-destructuring */
const axios = require('axios');
// google play
const moment = require('moment');
const Verifier = require('google-play-billing-validator');
const CoinPlan = require('../../model/coinPlan');
const VipPlanHistory = require('../../model/vipPlanHistory');

const VipPlan = require('../../model/vipPlan');
const History = require('../../model/history');
const Setting = require('../../model/setting');
const User = require('../../model/user');
const FlashCoin = require('../../model/flashCoin');

exports.store = async (req, res) => {
  try {
    if (!req.body.coin || !req.body.dollar || !req.body.productKey) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const coinplan = new CoinPlan();
    coinplan.coin = parseInt(req.body.coin);
    coinplan.dollar = parseInt(req.body.dollar);
    coinplan.productKey = req.body.productKey;
    coinplan.tag = req.body.tag;
    coinplan.extraCoin = req.body.extraCoin;
    coinplan.rupee = parseInt(req.body.rupee);

    await coinplan.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', coinplan: coinplan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.updateCoinPlan = async (req, res) => {
  try {
    if (!req.params.planId) {
      return res
        .status(200)
        .send({ status: false, message: 'Inavalid details' });
    }

    const Coinplan = await CoinPlan.findById(req.params.planId);

    if (!Coinplan) {
      return res
        .status(200)
        .send({ status: false, message: 'coinplan not exists' });
    }

    Coinplan.coin = parseInt(req.body.coin);
    Coinplan.dollar = parseInt(req.body.dollar);
    Coinplan.rupee = parseInt(req.body.rupee);
    Coinplan.productKey = req.body.productKey;
    Coinplan.tag = req.body.tag || '';
    Coinplan.extraCoin = req.body.extraCoin;

    await Coinplan.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', coinplan: Coinplan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.getCoinPlan = async (req, res) => {
  try {
    let searchingQuery = {};
    if (req?.query?.search !== 'ALL') {
      searchingQuery = {
        $expr: {
          $or: [
            // { tag: { $regex: req?.query?.search, $options: 'i' } },
            {
              $regexMatch: {
                input: { $toString: '$extraCoin' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: { $toString: '$dollar' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: { $toString: '$coin' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: { $toString: '$rupee' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          ],
        },
      };
    }
    const data = await CoinPlan.aggregate([
      { $match: { ...searchingQuery, isDelete: false } },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).send({ status: true, message: 'success', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

// get coinPlan for android
exports.getCoinPlanForAndroid = async (req, res) => {
  try {
    const plan = await CoinPlan.find({ isDelete: false, isActive: true }).sort({
      createdAt: -1,
    });

    const data = [];
    for (let index = 0; index < plan.length; index += 1) {
      const ele = plan[index];
      const obj = {
        _id: ele._id,
        coin: ele.coin,
        dollar: ele.dollar,
        tag: ele.tag,
        productKey: ele.productKey,
        rupee: ele.rupee,
        extraCoin: ele.extraCoin,
        isDelete: ele.isDelete,
        name: '',
        validity: '',
        validityType: '',
        discount: 0,
        rupeeWithDiscount: 0,
        image: '',
        isActive: ele.isActive,
        createdAt: ele.createdAt,
        updatedAt: ele.updatedAt,
      };

      data.push(obj);
    }

    return res.status(200).send({ status: true, message: 'success', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.destroy = async (req, res) => {
  try {
    if (!req.params.planId) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan Id is required !' });
    }

    const coinPlan = await CoinPlan.findById(req.params.planId);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not exists !' });
    }
    coinPlan.isDelete = true;
    await coinPlan.save();
    return res
      .status(200)
      .json({ status: true, message: 'Deleted successfully ' });
  } catch (error) {
    return res.status(500);
  }
};

// Activate Inactivate Switch
exports.activeInactive = async (req, res) => {
  try {
    if (!req.params.planId) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan Id is required !' });
    }

    const coinPlan = await CoinPlan.findById(req.params.planId);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not exists !' });
    }

    coinPlan.isActive = !coinPlan.isActive;

    await coinPlan.save();

    return res.status(200).json({
      status: true,
      message: 'success!!',
      coinPlan,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Invalid Details' });
  }
};

// get all user purchage history
exports.getPurchasedHistory = async (req, res) => {
  try {
    const start = req?.query?.start ? parseInt(req?.query?.start) : 1;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit) : 20;

    let history = [];
    let searching = {};
    let sort = { _id: -1 };

    if (req.query.search != 'All') {
      searching = {
        'userId.name': { $regex: req.query.search, $options: 'i' },
      };
    }

    switch (req?.query?.sort) {
      case 'uCoin':
        sort = { uCoin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'rupee':
        sort = { 'planId.rupee': parseInt(req.query?.sortType) || 1 };
        break;
      case 'dollar':
        sort = { 'planId.dollar': parseInt(req.query?.sortType) || 1 };
        break;
      default:
        break;
    }
    console.log('sort : ', sort);

    history = await History.aggregate([
      { $match: { type: { $in: [2, 7] }, planId: { $ne: null } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'appwisesettings',
                let: { packageName: '$packageName' },
                as: 'packageName',
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
                // preserveNullAndEmptyArrays: false,
              },
            },
          ],
          as: 'userId',
        },
      },
      { $unwind: { path: '$userId' } },
      { $match: searching },
      {
        $lookup: {
          from: 'coinplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $lookup: {
          from: 'falshcoins',
          localField: 'planId',
          foreignField: '_id',
          as: 'flashCoin',
        },
      },
      {
        $addFields: {
          planData: {
            $cond: [
              { $eq: [{ $size: '$plan' }, 1] },
              { $arrayElemAt: ['$plan', 0] },
              { $arrayElemAt: ['$flashCoin', 0] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userId: '$userId',
          type: 1,
          uCoin: 1,
          date: 1,
          orderId: 1,
          paymentGateway: 1,
          planId: '$planData',
          description: {
            $cond: [{ $eq: ['$type', 2] }, 'coinPlan', 'flashCoin'],
          },
        },
      },
      {
        $sort: sort,
      },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    const totalDollar = await History.aggregate([
      {
        $match: {
          type: { $in: [2, 7] },
          planId: { $ne: null },
        },
      },
      {
        $lookup: {
          from: 'coinplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $lookup: {
          from: 'falshcoins',
          localField: 'planId',
          foreignField: '_id',
          as: 'flashCoin',
        },
      },
      {
        $addFields: {
          planData: {
            $cond: [
              { $eq: [{ $size: '$plan' }, 1] },
              { $arrayElemAt: ['$plan', 0] },
              { $arrayElemAt: ['$flashCoin', 0] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          planId: '$planData',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$planId.dollar' },
        },
      },
    ]);

    const total = await History.find({
      type: { $in: [2, 7] },
      planId: { $ne: null },
    }).countDocuments();

    return res.status(200).json({
      status: true,
      message: 'success',
      total,
      totalDollar: totalDollar[0].total,
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: error.errorMessage || 'Server Error',
      user: '',
    });
  }
};

// add plan through google play
exports.payGooglePlay = async (req, res) => {
  try {
    console.log('req.body in payGooglePlay api ', req.body);
    if (
      !req.body.packageName &&
      !req.body.token &&
      !req.body.productId &&
      !req.body.userId &&
      !req.body.planId &&
      !req?.body?.type
    ) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!' });
    }
    const user = await User.findById(req.body.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not Exist!', user: {} });
    }

    let plan;
    if (req?.body?.type === 'coinPlan') {
      plan = await CoinPlan.findById(req.body.planId);
    } else if (req?.body?.type === 'flashCoin') {
      plan = await FlashCoin.findById(req.body.planId);
    } else if (req?.body?.type === 'vipPlan') {
      plan = await VipPlan.findById(req.body.planId);
      if (!plan) {
        return res
          .status(200)
          .send({ status: false, message: 'plan not exists' });
      }

      
      const purchaseHistory = new VipPlanHistory();
      purchaseHistory.userId = user._id;
      purchaseHistory.planId = plan._id;

      const validDate = moment().add(plan.validity, `${plan.validityType}`);
      purchaseHistory.expireDate = validDate.toISOString();

      await purchaseHistory.save();
      return res.status(200).json({
        status: true,
        message: 'success',
        user: { ...user.toObject(), isVip: true },
      });
    }

    if (!plan) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not Exist!', user: {} });
    }

    // const setting = await Setting.findOne({});

    // const options = {
    //   email: setting.googleInAppEmail,
    //   key: setting.googleInAppKey,
    // };

    // const verifier = new Verifier(options);

    // const packageName = req.body.packageName;
    // const token = req.body.token;
    // const productId = req.body.productId;
    // const receipt = {
    //   packageName,
    //   productId, // sku = productId subscription id
    //   purchaseToken: token,
    // };

    // const promiseData = await verifier.verifyINAPP(receipt);

    // if (promiseData.isSuccessful) {
    user.coin += plan.coin;
    user.purchageCoin += plan.coin;
    await user.save();

    const planCoin = await plan.coin

    const userHistory = new History();

    userHistory.userId = user._id;
    userHistory.planId = plan._id;
    userHistory.paymentGateway = req?.body?.paymentGateway
      ? req?.body?.paymentGateway
      : null;
    userHistory.uCoin = plan.coin;
    userHistory.date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    if (req?.body?.type === 'coinPlan') {
      userHistory.type = 2;
    } else if (req?.body?.type === 'flashCoin') {
      userHistory.type = 7;
    }

    await userHistory.save();

    return res.status(200).json({ status: true, message: 'success', planCoin, user });
    // }
    // return res
    //   .status(200)
    //   .json({ status: false, message: promiseData.errorMessage, user: {} });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: error.errorMessage || 'Server Error',
      user: '',
    });
  }
};

// payment update api web hook
exports.webHookPayment = async (req, res) => {
  try {
    console.log('paymenttttttttttttttttttttttttttbody', req.body);
    console.log('paymenttttttttttttttttttttttttttquery', req);

    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
