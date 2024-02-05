/* eslint-disable no-restricted-globals */
/* eslint-disable object-shorthand */
/* eslint-disable no-shadow */
/* eslint-disable no-inner-declarations */
const Cryptr = require('cryptr');
const fs = require('fs');
const shuffle = require('shuffle-array');
const moment = require('moment');
const FCM = require('fcm-node');
const excelToJson = require('convert-excel-to-json');
const { default: mongoose } = require('mongoose');
const Host = require('../../model/host');
const Setting = require('../../model/setting');
const History = require('../../model/history');
const Agency = require('../../model/agency');
const HostSettlementHistory = require('../../model/hostSettlementHistory');
const Topic = require('../../model/topic');
const host = require('../../model/host');
const AppWiseSetting = require('../../model/appWiseSetting');
const LiveUser = require('../../model/liveUser');

const fcm = new FCM(process?.env?.SERVER_KEY);
const cryptr = new Cryptr('myTotallySecretKey', {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

exports.index = async (req, res) => {
  try {
    let sort = { createdAt: -1 };
    let matchQuery;

    const start = req?.query?.start ? parseInt(req?.query?.start) : 1;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit) : 20;
    if (req.query.search !== 'ALL') {
      matchQuery = {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { 'agencyId.name': { $regex: req.query.search, $options: 'i' } },
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
      matchQuery = {};
    }
    switch (req?.query?.sort) {
      case 'coin':
        sort = { coin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'receiveCoin':
        sort = { receiveCoin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'receiveGift':
        sort = { receiveGift: parseInt(req.query?.sortType) || 1 };
        break;
      case 'lastSettlementCoin':
        sort = { lastSettlementCoin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'callCharge':
        sort = { callCharge: parseInt(req.query?.sortType) || 1 };
        break;
      default:
        break;
    }

    const host = await Host.aggregate([
      { $match: { type: parseInt(req.query.type) } },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agencyId',
        },
      },
      {
        $unwind: {
          path: '$agencyId',
          preserveNullAndEmptyArrays: false,
        },
      },
      { $match: matchQuery },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'countryId',
        },
      },
      {
        $unwind: {
          path: '$countryId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Host.find({
      type: parseInt(req?.query?.type),
    }).countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success', total, host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    if (!req.body.uniqueId || !req.body.password) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findOne({ uniqueId: req.body.uniqueId });

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    if (host.isBlock) {
      return res
        .status(200)
        .send({ status: false, message: 'you are blocked by admin' });
    }
    if (host.password !== req.body.password) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid password' });
    }

    host.fcm_token = req.body.fcmToken;
    host.identity = req.body.identity;
    host.lastLogin = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    await host.save();

    return res
      .status(200)
      .send({ status: true, message: 'Login successfully', host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.singup = async (req, res) => {
  try {
    if (!req.body.name || !req.body.password || !req.body.agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await Setting.findOne({});
    const interested = await Topic.findOne({ type: 1 });
    const iWant = await Topic.findOne({ type: 2 });
    const describe = await Topic.findOne({ type: 3 });
    const information = await Topic.findOne({ type: 4 });
    const host = new Host();

    host.name = req.body.name;
    host.agencyId = req.body.agencyId;
    host.uniqueId = await Promise.resolve(generateUsername());
    host.password = req.body.password;
    host.callCharge = setting.minPrivateCallCharge;
    host.profilePic = req.files.profilePic
      ? process.env.BASE_URL + req.files.profilePic[0].path
      : null;
    host.countryId = req.body.countryId;
    host.gender = 'Female';
    host.age = req.body.age;
    host.isOnline = req.body.isOnline;
    host.lastLogin = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });
    host.bio = req.body.bio ? req.body.bio : '';
    host.type = req.body.type;

    host.imageType = req?.body?.imageType;

    if (interested?.topic) {
      shuffle(interested.topic);
      host.interestedTopics = [].concat(interested.topic.slice(0, 3));
    }
    if (iWant?.topic) {
      shuffle(iWant.topic);
      host.iWantYour = [].concat(iWant?.topic.slice(0, 3));
    }
    if (describe?.topic) {
      shuffle(describe?.topic);
      host.describeMySelf = [].concat(describe?.topic.slice(0, 3));
    }
    if (information?.topic) {
      shuffle(information?.topic);
      host.moreInformation = [].concat(information?.topic.slice(0, 3));
    }
    host.image = [];
    if (req?.files?.image) {
      for (let index = 0; index < req.files.image.length; index += 1) {
        const element = req.files.image[index];
        const img = process.env.BASE_URL + element.path;
        host.image.push(img);
      }
    }

    if (req?.body?.image) {
      const imageArray = Array.isArray(req.body.image)
        ? req.body.image
        : [req.body.image];

      for (const image of imageArray) {
        const elements = image.split(',');

        for (const element of elements) {
          host.image.push(element);
        }
      }
    }

    await host.save();

    const data = await Host.findById(host._id)
      .populate('agencyId')
      .populate('countryId');

    return res
      .status(200)
      .send({ status: true, message: 'success', host: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

// update profile for android
exports.updateProfile = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    if (req.body.callCharge) {
      const setting = await Setting.findOne({});
      if (parseInt(req.body.callCharge) !== 0) {
        if (setting.minPrivateCallCharge > req.body.callCharge) {
          return res.status(200).json({
            status: false,
            message: ` minimum call charge must greater than  ${setting.minPrivateCallCharge} coin`,
          });
        }
      }
      host.callCharge = parseInt(req.body.callCharge);
    }
    host.name = req.body.name ? req.body.name : host.name;
    host.password = req.body.password ? req.body.password : host.password;
    host.agencyId = req.body.agencyId ? req.body.agencyId : host.agencyId;
    host.gender = req.body.gender ? req.body.gender : host.gender;
    host.bio = req.body.bio ? req.body.bio : host.bio;
    host.age = req.body.age ? req.body.age : host.age;
    host.countryId = req.body.countryId ? req.body.countryId : host.countryId;
    host.appVersion = req.body.appVersion
      ? req.body.appVersion
      : host.appVersion;
    if (req.file) {
      if (host.profilePic !== null) {
        const image = host.profilePic.split('storage');
        if (image) {
          if (fs.existsSync(`storage${image[1]}`)) {
            fs.unlinkSync(`storage${image[1]}`);
          }
        }
      }
      host.profilePic = process.env.BASE_URL + req.file.path;
    }

    await host.save();

    return res.status(200).send({ status: true, message: 'success!!', host });
  } catch (error) {
    console.log(error);
    return res.status(200).send({ status: false, message: 'Invalid details' });
  }
};

// update host profile for admin panel
exports.updateProfileByAdmin = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    if (req.body.callCharge) {
      const setting = await Setting.findOne({});
      if (parseInt(req.body.callCharge) !== 0) {
        if (setting.minPrivateCallCharge > req.body.callCharge) {
          return res.status(200).json({
            status: false,
            message: ` minimum call charge must greater than  ${setting.minPrivateCallCharge} coin`,
          });
        }
      }
      host.callCharge = parseInt(req.body.callCharge);
    }
    host.name = req.body.name ? req.body.name : host.name;
    host.password = req.body.password ? req.body.password : host.password;
    host.agencyId = req.body.agencyId ? req.body.agencyId : host.agencyId;
    host.gender = req.body.gender ? req.body.gender : host.gender;
    host.bio = req.body.bio ? req.body.bio : host.bio;
    host.countryId = req.body.countryId ? req.body.countryId : host.countryId;
    host.imageType = req?.body?.imageType
      ? req?.body?.imageType
      : host.imageType;
    if (req.files.profilePic) {
      if (host.profilePic !== null) {
        const image = host.profilePic.split('storage');
        if (image) {
          if (fs.existsSync(`storage${image[1]}`)) {
            fs.unlinkSync(`storage${image[1]}`);
          }
        }
      }
      host.profilePic = process.env.BASE_URL + req.files.profilePic[0].path;
    }

    if (req?.files.image) {
      const data = [];
      for (let index = 0; index < req?.files?.image.length; index += 1) {
        const element = req?.files?.image[index].path;
        data.push(process?.env?.BASE_URL + element);
        // host.image = host?.image?.concat();
      }
      host.image = [...host.image, ...data];
    }

    if (req?.body?.image) {
      const imageArray = Array.isArray(req.body.image)
        ? req.body.image
        : [req.body.image];

      host.image = [];
      for (const image of imageArray) {
        const elements = image.split(',');
        for (const element of elements) {
          host.image.push(element);
        }
      }
    }
    await host.save();
    const data = await Host.findById(host._id)
      .populate('agencyId', 'name')
      .populate('countryId', 'name');

    return res
      .status(200)
      .send({ status: true, message: 'success!!', host: data });
  } catch (error) {
    console.log(error);
    return res.status(200).send({ status: false, message: 'Invalid details' });
  }
};

// delete topic in host profile
exports.deleteHostTopic = async (req, res) => {
  try {
    if (!req?.query?.hostId || !req?.query?.type || !req?.query?.position) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req?.query?.hostId);
    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host does not exists' });
    }

    if (req?.query?.type == 1) {
      host.interestedTopics.splice(parseInt(req?.query?.position), 1);
      await host.save();
    }
    if (req?.query?.type == 2) {
      host.iWantYour.splice(parseInt(req?.query?.position), 1);
      await host.save();
    }
    if (req?.query?.type == 3) {
      host.describeMySelf.splice(parseInt(req?.query?.position), 1);
      await host.save();
    }
    if (req?.query?.type == 4) {
      host.moreInformation.splice(parseInt(req?.query?.position), 1);
      await host.save();
    }

    return res.status(200).send({ status: true, message: 'success!!', host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// update host topic in host profile
exports.updateHostTopic = async (req, res) => {
  try {
    const { hostId } = req?.params;
    const { topic, type } = req?.body;

    if (!hostId || !topic || !type) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const host = await Host.findById(hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host does not found' });
    }
    const data = [];
    const topicArray = Array.isArray(topic) ? topic : [topic];
    for (let index = 0; index < topicArray[0].split(',').length; index += 1) {
      const element = topicArray[0].split(',')[index];

      data.push(element);
    }
    if (type == 1) {
      host.interestedTopics.push(...data);
    }
    if (type == 2) {
      host.iWantYour.push(...data);
    }
    if (type == 3) {
      host.describeMySelf.push(...data);
    }
    if (type == 4) {
      host.moreInformation.push(...data);
    }

    await host.save();

    return res.status(200).send({ status: true, message: 'success!!', host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.blockUnblock = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req.query.hostId)
      .populate('agencyId')
      .populate('countryId', 'name');

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    host.isBlock = !host.isBlock;
    await host.save();

    return res.status(200).send({ status: true, message: 'success!!', host });
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req.query.hostId).populate(
      'countryId',
      'name'
    );
    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }
    if (host.isBlock) {
      return res
        .status(200)
        .send({ status: false, message: 'Host is Blocked by Admin' });
    }
    const settlementCoin = await HostSettlementHistory.findOne({
      hostId: host?._id,
    }).sort({
      createdAt: -1,
    });
    return res.status(200).send({
      status: true,
      message: 'success!!',
      host,
      settlement: settlementCoin ? settlementCoin.finalTotalAmount : 0,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.updateImages = async (req, res) => {
  try {
    const { hostId, position } = req.body;

    const host = await Host.findById(hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }
    const image =
      host.image.length > 0 &&
      host.image[req.body.position] !== undefined &&
      host.image[req.body.position].split('storage');

    if (image) {
      if (fs.existsSync(`storage${image[1]}`)) {
        fs.unlinkSync(`storage${image[1]}`);
      }
    }

    await host.image.splice(
      position,
      1,
      process?.env?.BASE_URL + req.file.path
    );

    await host.save();

    let hostImage;
    if (image) {
      hostImage = host.image.pop();
    } else {
      hostImage = host.image[req.body.position];
    }

    return res
      .status(200)
      .send({ status: true, message: 'success', response: hostImage });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

// delete images
exports.deleteImages = async (req, res) => {
  try {
    const { hostId, position } = req?.query;

    const host = await Host.findById(hostId);

    const image =
      host.image.length > 0 &&
      host.image[position] !== undefined &&
      host.image[position].split('storage');

    if (image) {
      if (fs.existsSync(`storage${image[1]}`)) {
        fs.unlinkSync(`storage${image[1]}`);
      }
    }

    const imageData = host.image[position];

    host.image = host?.image?.filter((data) => data != imageData);

    await host.save();

    return res.status(200).send({ status: true, message: 'success', host });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

// delete images by admin in admin penal
exports.deleteImagesByAdmin = async (req, res) => {
  try {
    const { hostId, position } = req?.query;

    const host = await Host.findById(hostId);

    const image =
      host.image.length > 0 &&
      host.image[position] !== undefined &&
      host.image[position].split('storage');

    if (image) {
      if (fs.existsSync(`storage${image[1]}`)) {
        fs.unlinkSync(`storage${image[1]}`);
      }
    }

    const imageData = host.image[position];

    host.image = host?.image?.filter((data) => data != imageData);

    await host.save();

    return res.status(200).send({ status: true, message: 'success', host });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.createFakeHost = async (req, res) => {
  try {
    if (!req.body.name) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const interested = await Topic.findOne({ type: 1 });
    const iWant = await Topic.findOne({ type: 2 });
    const describe = await Topic.findOne({ type: 3 });
    const information = await Topic.findOne({ type: 4 });
    const agency = await Agency.findOne({ type: 2 });
    const host = new Host();

    host.name = req.body.name;
    host.agencyId = agency._id;
    host.gender = 'Female';
    host.uniqueId = await Promise.resolve(generateUsername());
    // host.password = req.body.password;
    host.profilePic = req.files.profilePic
      ? process.env.BASE_URL + req.files.profilePic[0].path
      : req?.body?.profilePic;
    host.countryId = req.body.countryId;
    host.age = req.body.age;
    host.coin = req?.body?.coin || 0;
    host.callCharge = req?.body?.callCharge || 0;
    host.bio = req.body.bio;
    host.videoType = req?.body?.videoType;
    host.isOnline = true;
    host.imageType = req?.body?.imageType;
    host.lastLogin = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });
    host.profilePicType = req?.body?.profilePicType;
    host.video = req?.files?.video
      ? process.env.BASE_URL + req?.files?.video[0].path
      : req?.body?.video;
    host.type = 2;

    if (interested?.topic) {
      shuffle(interested.topic);
      host.interestedTopics = [].concat(interested.topic.slice(0, 3));
    }
    if (iWant?.topic) {
      shuffle(iWant.topic);
      host.iWantYour = [].concat(iWant?.topic.slice(0, 3));
    }
    if (describe?.topic) {
      shuffle(describe?.topic);
      host.describeMySelf = [].concat(describe?.topic.slice(0, 3));
    }
    if (information?.topic) {
      shuffle(information?.topic);
      host.moreInformation = [].concat(information?.topic.slice(0, 3));
    }
    host.image = [];
    if (req.files.image) {
      for (let index = 0; index < req.files.image.length; index += 1) {
        const element = req.files.image[index];
        const img = process.env.BASE_URL + element.path;
        host.image.push(img);
      }
    }

    if (req?.body?.image) {
      // If 'image' is a string, convert it to an array with a single element
      const imageArray = Array.isArray(req.body.image)
        ? req.body.image
        : [req.body.image];

      for (const image of imageArray) {
        const elements = image.split(',');
        for (const element of elements) {
          console.log('element:', element);
          host.image.push(element);
        }
      }
    }

    // if (req?.body?.image) {
    //   for (let index = 0; index < req.body.image.length; index += 1) {
    //     const elements = req.body.image[index].split(',');
    //     for (const element of elements) {
    //       console.log('element:', element);
    //       host.image.push(element);
    //     }
    //   }
    // }

    await host.save();

    const hostData = await Host.findById(host._id)
      .populate('agencyId')
      .populate('countryId');

    return res
      .status(200)
      .send({ status: true, message: 'success', host: hostData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.hostIsOnline = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res.send({ status: false, message: 'host not exists' });
    }

    host.isOnline = !host.isOnline;

    await host.save();

    return res.status(200).send({ status: true, message: 'success!!', host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

// check host is online or not
exports.checkHostIsOnline = async (req, res) => {
  try {
    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res.status(200).json({
        status: false,
        message: 'Host Not Found !',
      });
    }
    return res.status(200).json({
      status: true,
      message: 'Successful !',
      online: host.isOnline,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: error.message || 'Sever Error' });
  }
};

const generateUsername = async () => {
  const random = () =>
    // eslint-disable-next-line implicit-arrow-linebreak
    Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;

  let uniqueId = random();

  let host = await Host.findOne({ uniqueId });
  while (host) {
    uniqueId = random();
    host = await Host.findOne({ uniqueId });
  }

  return uniqueId;
};

// random host thumb for user
exports.getRandomHost = async (req, res) => {
  try {
    const { country, packageName } = req.query;
    let query;
    if (country === 'Global') {
      query = {
        isBlock: false,
      };
    } else {
      query = {
        countryId: new mongoose.Types.ObjectId(country),
        isBlock: false,
      };
    }

    const setting = await AppWiseSetting.findOne({ packageName: packageName });
    // eslint-disable-next-line no-shadow
    const host = await Host.aggregate([
      {
        $match: query,
      },
      {
        $sort: {
          isLive: -1, // Sort in descending order based on the "isLive" field
          isOnline: -1,
          type: 1,
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'countryId',
        },
      },
      {
        $unwind: '$countryId',
      },
      {
        $addFields: {
          counntry: '$countryId.name',
          flag: '$countryId.flag',
          liveview: setting
            ? {
                $floor: {
                  $add: [
                    {
                      $multiply: [
                        {
                          $subtract: [setting.maxLiveView, setting.minLiveView],
                        },
                        { $rand: {} },
                      ],
                    },
                    setting.minLiveView,
                  ],
                },
              }
            : 0,
        },
      },
      // {
      //   $project: {
      //     uniqueId: 1,
      //     profilePic: 1,
      //     image: 1,
      //     coin: 1,
      //     isLive: 1,
      //     channel: 1,
      //     isBusy: 1,
      //     type: 1,
      //     isOnline: 1,
      //     age: 1,
      //     identity: 1,
      //     gender: 1,
      //     name: 1,
      //     interestedTopics: 1,
      //     iWantYour: 1,
      //     describeMySelf: 1,
      //     moreInformation: 1,
      //     bio: 1,
      //     counntry: '$countryId.name',
      //     flag: '$countryId.flag',
      //     receiveGift: 1,
      //     receiveCoin: 1,
      //     liveview: setting
      //       ? {
      //           $floor: {
      //             $add: [
      //               {
      //                 $multiply: [
      //                   {
      //                     $subtract: [setting.maxLiveView, setting.minLiveView],
      //                   },
      //                   { $rand: {} },
      //                 ],
      //               },
      //               setting.minLiveView,
      //             ],
      //           },
      //         }
      //       : 0,
      //   },
      // },
      { $skip: req.query.start ? parseInt(req.query.start) : 0 },
      { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
    ]);

    return res
      .status(200)
      .send({ status: true, message: 'success!!', host: host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
// random host for socket android for user
exports.getHostProfileForApp = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid Details' });
    }

    // eslint-disable-next-line no-shadow
    const host = await Host.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.query.hostId),
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'countryId',
        },
      },
      {
        $unwind: '$countryId',
      },
      {
        $project: {
          uniqueId: 1,
          profilePic: 1,
          image: 1,
          coin: 1,
          isLive: 1,
          channel: 1,
          isBusy: 1,
          isOnline: 1,
          identity: 1,
          age: 1,
          gender: 1,
          name: 1,
          bio: 1,
          counntry: '$countryId.name',
          flag: '$countryId.flag',
          receiveGift: 1,
          receiveCoin: 1,
        },
      },
      // { $skip: req.query.start ? parseInt(req.query.start) : 0 },
      // { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
    ]);

    return res
      .status(200)
      .send({ status: true, message: 'success!!', host: host[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get live host for android
exports.getRandomLiveHost = async (req, res) => {
  try {
    console.log('req.query.start  ', req.query.start);
    let skip;
    const countHost = await LiveUser.find({}).countDocuments();
    console.log(countHost);

    let start = req.query.start ? parseInt(req.query.start) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 20;
    if (start >= countHost) {
      start = 0;
    }
    if (countHost <= start + limit) {
      skip = countHost;
    } else {
      console.log('ELSE  ');
      skip = start + limit;
    }

    const host = await LiveUser.aggregate([
      {
        $lookup: {
          from: 'hosts',
          localField: 'liveHostId',
          foreignField: '_id',
          as: 'host',
        },
      },
      {
        $unwind: {
          path: '$host',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          isLive: true,
          flag: '$countryFlag',
        },
      },
      {
        $project: {
          mainId: '$_id',
          _id: '$host._id',
          uniqueId: '$host.uniqueId',
          profilePic: '$host.profilePic',
          image: '$host.image',
          coin: '$host.coin',
          isLive: 1,
          channel: '$host.channel',
          isBusy: '$host.isBusy',
          isOnline: '$host.isOnline',
          age: '$host.age',
          identity: '$host.identity',
          gender: '$host.gender',
          name: '$host.name',
          bio: '$host.bio',
          counntry: '$country',
          flag: 1,
          receiveGift: '$host.receiveGift',
          receiveCoin: '$host.receiveCoin',
        },
      },
      { $skip: start },
      { $limit: limit },
      { $sort: { mainId: -1 } },
    ]);

    // await shuffle(host);
    console.log('skip : ', skip);
    console.log('countHost : ', countHost);
    console.log('host.length : ', host.length);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      start:
        host.length == countHost ? start : skip >= start ? skip : host.length,
      total: host.length,
      host: host,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
// approve or reject host by admin
exports.approvedHost = async (req, res) => {
  try {
    console.log(req.query);
    if (!req?.query?.hostId || !req?.query?.type) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid details!' });
    }

    const host = await Host.findById(req?.query?.hostId);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'Host does not Exist!' });
    }

    if (req?.query?.type === 'Approved') {
      host.isApproved = true;
      host.isRejected = false;

      await host.save();
    } else if (req?.query?.type === 'Rejected') {
      host.isRejected = true;
      host.isApproved = false;
      await host.save();
    }

    return res.status(200).json({ status: true, message: 'Success!!', host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// add or cut coin by admin
exports.addLessCoinHost = async (req, res) => {
  try {
    const { hostId, coin } = req.body;

    if (!hostId || !coin) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details ' });
    }

    const host = await Host.findById(hostId);
    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    host.coin = coin;
    host.receiveCoin += parseInt(coin);

    await host.save();

    const hostHistory = new History();

    hostHistory.hostId = host._id;
    hostHistory.hCoin = parseInt(coin);
    hostHistory.type = 5;
    hostHistory.date = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    await hostHistory.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', response: host });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: 'Internal server error' });
  }
};

// get host by agency wise
exports.getHostAgencyWise = async (req, res) => {
  try {
    let matchQuery;
    let sort = { createdAt: -1 };
    const start = req?.query?.start ? parseInt(req?.query?.start) : 1;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit) : 20;
    if (req.query.search !== 'ALL') {
      matchQuery = {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { gender: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { agencyId: { $regex: req.query.search, $options: 'i' } },
        ],
      };
    } else {
      matchQuery = { _id: { $ne: null } };
    }

    switch (req?.query?.sort) {
      case 'coin':
        sort = { coin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'receiveCoin':
        sort = { receiveCoin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'receiveGift':
        sort = { receiveGift: parseInt(req.query?.sortType) || 1 };
        break;
      case 'lastSettlementCoin':
        sort = { lastSettlementCoin: parseInt(req.query?.sortType) || 1 };
        break;
      case 'callCharge':
        sort = { callCharge: parseInt(req.query?.sortType) || 1 };
        break;
      default:
        break;
    }

    const host = await Host.aggregate([
      {
        $match: {
          agencyId: new mongoose.Types.ObjectId(req?.query?.agencyId),
        },
      },
      { $match: matchQuery },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agencyId',
        },
      },
      {
        $unwind: {
          path: '$agencyId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'countryId',
        },
      },
      {
        $unwind: {
          path: '$countryId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          name: 1,
          uniqueId: 1,
          bio: 1,
          profilePic: 1,
          image: 1,
          appVersion: 1,
          coin: 1,
          receiveCoin: 1,
          receiveGift: 1,
          isOnline: 1,
          isLive: 1,
          isBusy: 1,
          age: 1,
          password: 1,
          gender: 1,
          callCharge: 1,
          countryId: 1,
          agencyId: 1,
          lastSettlementCoin: 1,
          type: 1,
          createdAt: 1,
          lastLogin: 1,
          isApproved: 1,
          isRejected: 1,
          isBlock: 1,
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Host.find({
      agencyId: new mongoose.Types.ObjectId(req?.query?.agencyId),
    }).countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', total, host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal servre error' });
  }
};

// insert multiple fake host
// exports.insertMultipleFakeHost = async (req, res) => {
//   try {
//     if (req?.body?.videoType == 0) {
//       if (req?.body?.name?.split(',').length !== req?.files?.video?.length) {
//         return res
//           .status(200)
//           .send({ status: false, message: 'Invalid details ' });
//       }
//     } else if (req?.body?.videoType == 1) {
//       if (
//         req?.body?.name?.split(',').length !==
//         req?.body?.video?.split(',').length
//       ) {
//         return res
//           .status(200)
//           .send({ status: false, message: 'Invalid details' });
//       }
//     }

//     if (req?.body?.imageType == 0) {
//       if (
//         req?.body?.name?.split(',').length !== req?.files?.profilePic?.length
//       ) {
//         return res
//           .status(200)
//           .send({ status: false, message: 'Invalid details' });
//       }
//     } else if (req?.body?.imageType == 1) {
//       if (
//         req?.body?.name?.split(',').length !==
//         req?.body?.profilePic?.split(',').length
//       ) {
//         return res
//           .status(200)
//           .send({ status: false, message: 'Invalid details' });
//       }
//     }

//     const agency = await Agency.findOne({ type: 2 });
//     const documentsToInsert = await Promise.all(
//       req?.body?.name?.split(',')?.map(async (_, index) => ({
//         name: req?.body?.name?.split(',')[index],
//         video: req?.files?.video
//           ? process?.env?.BASE_URL + req.files.video[index].path
//           : req.body?.video?.split(',')[index],
//         profilePic: req?.files?.profilePic
//           ? process?.env?.BASE_URL + req.files.profilePic[index].path
//           : req.body?.profilePic?.split(',')[index],
//         countryId: '647edf4a693e0fdc4a7705ff',
//         videoType: req?.body?.videoType,
//         imageType: req?.body?.imageType,
//         gender: 'Female',
//         uniqueId: await Promise.resolve(generateUsername()),
//         password: req?.body?.password || null,
//         agencyId: agency?._id,
//         type: 2,
//       }))
//     );
//     const data = await Host.insertMany(documentsToInsert);
//     const hostData = [];

//     for (let index = 0; index < data.length; index += 1) {
//       const response = data[index];

//       const host = await Host.findById(response._id)
//         .populate('countryId', 'name')
//         .populate('agencyId');
//       hostData.push(host);
//     }
//     return res
//       .status(200)
//       .send({ status: true, message: 'success!!', hostData });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .send({ status: false, message: 'Internal server error' });
//   }
// };

// update fake host for admin panel
exports.updateFakeHost = async (req, res) => {
  try {
    const host = await Host.findById(req?.params?.hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    host.coin = req?.body?.coin ? parseInt(req?.body?.coin) : host?.coin;
    host.name = req?.body?.name ? req?.body?.name : host?.name;
    host.bio = req?.body?.bio ? req?.body?.bio : host.bio;
    host.countryId = req?.body?.countryId
      ? req?.body?.countryId
      : host.countryId;
    host.callCharge = req?.body?.callCharge
      ? req?.body?.callCharge
      : host.callCharge;
    host.videoType = req?.body?.videoType
      ? req?.body?.videoType
      : host.videoType;
    host.profilePicType = req?.body?.profilePicType
      ? req?.body?.profilePicType
      : host.profilePicType;
    host.imageType = req?.body?.imageType
      ? req?.body?.imageType
      : host.imageType;

    if (req?.body?.videoType == 0) {
      if (req?.files?.video) {
        const video_ = host?.video?.split('storage');
        if (video_) {
          if (fs.existsSync(`storage${video_[1]}`)) {
            fs.unlinkSync(`storage${video_[1]}`);
          }
        }
      }
      console.log('video', req?.files.video);
      host.video = req?.files.video
        ? process?.env?.BASE_URL + req?.files.video[0].path
        : host.video;
    }
    if (req?.body?.videoType == 1) {
      host.video = req?.body?.video ? req?.body?.video : host.video;
    }
    if (req?.body?.profilePicType == 0) {
      if (req?.files?.profilePic) {
        const profilePic_ = host?.profilePic?.split('storage');
        if (profilePic_) {
          if (fs.existsSync(`storage${profilePic_[1]}`)) {
            fs.unlinkSync(`storage${profilePic_[1]}`);
          }
        }
      }
      host.profilePic = req?.files.profilePic
        ? process?.env?.BASE_URL + req?.files.profilePic[0].path
        : host.profilePic;
    }
    if (req?.body?.profilePicType == 1) {
      host.profilePic = req?.body?.profilePic
        ? req?.body?.profilePic
        : host.profilePic;
    }

    if (req?.body?.imageType == 0 && req?.files?.image) {
      const data = [];
      for (let index = 0; index < req?.files?.image.length; index += 1) {
        const element = req?.files?.image[index].path;
        data.push(process?.env?.BASE_URL + element);
        // host.image = host?.image?.concat();
      }
      host.image = [...host.image, ...data];
    }

    if (req?.body?.imageType == 1 && req?.body?.image) {
      const imageArray = Array.isArray(req.body.image)
        ? req.body.image
        : [req.body.image];

      host.image = [];
      for (const image of imageArray) {
        const elements = image.split(',');
        for (const element of elements) {
          host.image.push(element);
        }
      }
    }
    await host.save();

    const data = await Host.findById(host._id)
      .populate('countryId', 'name')
      .populate('agencyId');
    return res
      .status(200)
      .send({ status: true, message: 'success!!', host: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// add fake host using excel
exports.insertFakeHostByExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const data = [];
    const result = await excelToJson({
      sourceFile: req?.file?.path,
      header: {
        rows: 1,
      },
      columnToKey: {
        '*': '{{columnHeader}}',
      },
    });

    const interested = await Topic.findOne({ type: 1 });
    const iWant = await Topic.findOne({ type: 2 });
    const describe = await Topic.findOne({ type: 3 });
    const information = await Topic.findOne({ type: 4 });
    const agency = await Agency.findOne({ type: 2 });
    const error = [];
    for (let index = 0; index < result.Sheet1.length; index += 1) {
      const ele = result?.Sheet1[index];

      console.log('hostDataaaaaaaaaaaaa', ele);

      if (!ele?.name || typeof ele.name !== 'string') {
        error.push(`Name is require for row no:${index + 1}`);
      }
      if (!ele?.video) {
        error.push(`video is require for row no:${index + 1}`);
      }
      if (!ele?.profilePic) {
        error.push(`profilePic is require for row no:${index + 1}`);
      }
      if (!ele?.bio) {
        error.push(`bio is require for row no:${index + 1}`);
      }
      if (!ele?.age) {
        error.push(`age is require row no:${index + 1}`);
      }
      if (isNaN(parseInt(ele.age))) {
        error.push(`please enter valid age for row no:${index + 1}`);
      }
      if (!ele?.image) {
        error.push(`image is require for row no:${index + 1}`);
      }
    }

    if (error?.length > 0) {
      fs.unlinkSync(req?.file?.path);
      return res.status(200).send({ status: false, error });
    }
    for (let index = 0; index < result.Sheet1.length; index += 1) {
      const ele = result?.Sheet1[index];

      console.log('hostDataaaaaaaaaaaaa', ele);

      const hostImage = [];
      let InterestedTopics = [];
      let IWantYour = [];
      let DeclarationsescribeMySelf = [];
      let MoreInformation = [];
      const lastLoginDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      for (let index = 0; index < ele.image.split(',').length; index += 1) {
        const img = ele.image.split(',')[index];

        hostImage.push(img);
      }
      if (interested?.topic) {
        shuffle(interested.topic);
        InterestedTopics = [].concat(interested.topic.slice(0, 3));
      }
      if (iWant?.topic) {
        shuffle(iWant.topic);
        IWantYour = [].concat(iWant?.topic.slice(0, 3));
      }
      if (describe?.topic) {
        shuffle(describe?.topic);
        DeclarationsescribeMySelf = [].concat(describe?.topic.slice(0, 3));
      }
      if (information?.topic) {
        shuffle(information?.topic);
        MoreInformation = [].concat(information?.topic.slice(0, 3));
      }
      const hostData = {
        name: ele?.name,
        video: ele?.video,
        age: ele?.age,
        videoType: 1,
        imageType: 1,
        profilePic: ele?.profilePic,
        bio: ele?.bio,
        profilePicType: 1,
        gender: 'Female',
        image: hostImage,
        agencyId: agency?._id,
        coin: ele?.coin,
        callCharge: ele?.callCharge,
        uniqueId: await Promise.resolve(generateUsername()),
        type: 2,
        countryId: '647edf4a693e0fdc4a7705ff',
        lastLogin: lastLoginDate,
        isOnline: true,
        interestedTopics: InterestedTopics,
        iWantYour: IWantYour,
        declarationsescribeMySelf: DeclarationsescribeMySelf,
        moreInformation: MoreInformation,
      };

      data.push(hostData);
    }

    const Data = await Host.insertMany(data);

    const hostData = [];
    for (let index = 0; index < Data.length; index += 1) {
      const response = Data[index];

      const host = await Host.findById(response._id)
        .populate('countryId', 'name')
        .populate('agencyId');
      hostData.push(host);
    }
    fs.unlinkSync(req?.file?.path);
    return res
      .status(200)
      .send({ status: true, message: 'success!!', hostData });
  } catch (error) {
    fs.unlinkSync(req?.file?.path);
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Please Enter Valid Details' });
  }
};

// get random fake host for android
exports.getRamdomFakeHost = async (req, res) => {
  try {
    const host = await Host.find({ type: 2 }).populate(
      'countryId',
      'name flag'
    );
    if (!host) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }
    shuffle(host);

    return res
      .status(200)
      .send({ status: true, message: 'success!!', host: host[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// api for switch random call or not
exports.switchForRandomCall = async (req, res) => {
  try {
    if (!req?.query?.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req?.query?.hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host does not exists' });
    }

    host.forRandomCall = req?.query?.forRandomCall;

    await host.save();

    return res.status(200).send({
      status: true,
      message: 'success!!',
      randomCall: host.forRandomCall,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get fake host list for add fake story
exports.getFakeHostForStory = async (req, res) => {
  try {
    const host = await Host.find({ type: 2 }, { _id: 1, name: 1 });

    return res.status(200).send({ status: true, message: 'success!!', host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: error || 'Internal server error' });
  }
};

// add or cut coin by admin
exports.getParticularLiveHost = async (req, res) => {
  try {
    if (!req?.query?.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const host = await Host.findById(req?.query?.hostId).populate('countryId');
    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'Host Does Not Found !!' });
    }

    const liveUser = await LiveUser.exists({ liveHostId: host?._id });

    return res.status(200).send({
      status: true,
      message: 'success!!',
      hostData: {
        ...host?._doc,
        flag: host?._doc.countryId.flag,
        counntry: host?._doc.countryId.name,
        isLive: liveUser ? true : false,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: 'Internal server error' });
  }
};
