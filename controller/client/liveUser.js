const moment = require('moment');
const Host = require('../../model/host');
const LiveUser = require('../../model/liveUser');
const LiveStreamingHistory = require('../../model/liveStreamingHistory');
const Block = require('../../model/block');
const User = require('../../model/user');
const Setting = require('../../model/setting');
const FCM = require('fcm-node');
const fcm = new FCM(process?.env?.SERVER_KEY);

exports.hostIsLive = async (req, res) => {
  try {
    console.log('host is live api call  ======= ');
    const { hostId, agoraUID } = req.body;
    const host = await Host.findById(hostId).populate('countryId', 'name flag');

    if (!host) {
      return res.status(200).json({
        status: false,
        message: 'host does not exists',
      });
    }
    if (!host.isApproved) {
      return res.status(200).json({
        status: false,
        message: 'Ops! Your are not able to live right now.',
      });
    }
    const liveStreamingHistory = new LiveStreamingHistory();
    liveStreamingHistory.hostId = host._id;
    liveStreamingHistory.startTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });
    await liveStreamingHistory.save();

    host.channel = liveStreamingHistory._id;
    await host.save();

    const liveUser = await LiveUser.findOne({ liveHostId: host._id });
    const createLiveUser = new LiveUser(); // @todo
    let LiveUserData;

    if (liveUser) {
      console.log('liveUSer exists .....');
      // liveUser.isPublic = req.body.isPublic;
      liveUser.liveStreamingId = liveStreamingHistory._id;
      liveUser.agoraUID = agoraUID;
      LiveUserData = await LiveUserFunction(liveUser, host);
    } else {
      console.log("liveUSer don't exists .....");

      // createLiveUser.isPublic = req.body.isPublic;
      createLiveUser.liveStreamingId = liveStreamingHistory._id;
      createLiveUser.agoraUID = agoraUID;
      LiveUserData = await LiveUserFunction(createLiveUser, host);
    }

    let matchQuery = {};
    if (liveUser) {
      matchQuery = { $match: { _id: { $eq: liveUser._id } } };
    } else {
      matchQuery = { $match: { _id: { $eq: createLiveUser._id } } };
    }

    const liveUser_ = await LiveUser.aggregate([matchQuery]);

    const setting = await Setting.findOne({});

    const view = setting
      ? Math.floor(
          Math.random() * (setting.maxLiveView - setting?.minLiveView) +
            setting?.minLiveView
        )
      : 0;

    const liveUsersWithView = liveUser_.map((user) => ({
      ...user,
      liveview: view,
    }));

    res.status(200).json({
      status: true,
      message: 'Success!!',
      liveUser: liveUsersWithView[0],
    });

    const topic = '/topics/PEPSIUSER';

    const payload = {
      to: topic,
      time_to_live: 30,
      notification: {
        body: 'Host is live',
        title: `${host?.name} is Live Now ... !`,
        image: host?.image,
      },
      data: {
        data: {
          body: 'Host is live',
          title: `${host?.name} is Live Now ... !`,
          image: host?.image,
        },
      },
      type: 'LIVEUSER',
    };

    await fcm.send(payload, async function (err, response) {
      if (err) {
        console.log('error in liveUser notification', err);
      } else {
        console.log('Success in liveUser notification send');
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

const LiveUserFunction = async (host, data) => {
  console.log('countryFlag :', data.countryId);
  host.name = data.name;
  host.country = data.countryId.name;
  host.countryFlag = data.countryId.flag;
  host.image = data.profileImage;
  host.token = data.token;
  host.channel = data.channel;
  host.coin = data.coin;
  host.liveHostId = data._id;
  host.dob = data.dob;
  console.log(' host.countryFlag: ', host.countryFlag);
  await host.save();

  return host;
};

// get live host list
exports.getLiveHost = async (req, res) => {
  try {
    console.log('api call=');
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details' });
    }

    const user = await User.findById(req.query.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User Does Not Exist !' });
    }

    const blockHost = await Block.find({ userId: user._id }).distinct('hostId');

    const host = await Host.aggregate([
      {
        $match: {
          _id: { $nin: blockHost },
          isApproved: true,
          isBlock: false,
          isLive: true,
        },
      },
      // {
      //   $lookup: {
      //     from: "favorites",
      //     let: { hostId: "$_id", userId: user._id },
      //     as: "favorite",
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$userId", "$$userId"] },
      //               { $eq: ["$hostId", "$$hostId"] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      {
        $lookup: {
          from: 'liveusers',
          as: 'liveUser',
          let: { hostId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$hostId', '$liveHostId'],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$liveUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $addFields: { favorite: false } },
      {
        $project: {
          _id: 1,
          image: 1,
          profileImage: 1,
          isLive: 1,
          token: 1,
          channel: 1,
          country: 1,
          name: 1,
          age: 1,
          callCharge: 1,
          isOnline: 1,
          isBusy: 1,
          coin: 1,
          status: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', true] },
                      { $eq: ['$isLive', true] },
                    ],
                  },
                  then: 'Live', // @todo
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', true] },
                      { $eq: ['$isLive', false] },
                      { $eq: ['$isBusy', false] },
                    ],
                  },
                  then: 'Online',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', true] },
                      { $eq: ['$isLive', false] },
                      { $eq: ['$isBusy', true] },
                    ],
                  },
                  then: 'Busy',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', false] },
                      { $eq: ['$isLive', false] },
                      { $eq: ['$isBusy', false] },
                    ],
                  },
                  then: 'Offline',
                },
              ],
              default: 'Offline',
            },
          },
          sortVector: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', true] },
                      { $eq: ['$isLive', true] },
                      { $eq: ['$isBusy', false] },
                    ],
                  },
                  then: 1,
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', true] },
                      { $eq: ['$isLive', false] },
                      { $eq: ['$isBusy', false] },
                    ],
                  },
                  then: 2,
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$isOnline', true] },
                      { $eq: ['$isLive', false] },
                      { $eq: ['$isBusy', true] },
                    ],
                  },
                  then: 3,
                },
              ],

              default: 4,
            },
          },
          // favorite: {
          //   $cond: [{ $eq: [{ $size: "$favorite" }, 0] }, false, true],
          // },
          favorite: 1,

          liveStreamingId: {
            $cond: [
              { $eq: ['$isLive', true] },
              '$liveUser.liveStreamingId',
              '',
            ],
          },
          view: {
            $cond: [{ $eq: ['$isLive', true] }, '$liveUser.view', null],
          },
        },
      },

      {
        $group: {
          _id: '$status',
          data: { $push: '$$ROOT' },
        },
      },

      // {
      //   $addFields: {
      //     data: {
      //       $function: {
      //         body(data) {
      //           return data.sort(() => Math.random() - 0.5); // shuffle the data array
      //         },
      //         args: ['$data'],
      //         lang: 'js',
      //       },
      //     },
      //   },
      // },

      // { $unwind: '$data' },
      // { $replaceRoot: { newRoot: '$data' } },

      { $sort: { sortVector: 1 } },

      { $skip: req.query.start ? parseInt(req.query.start) : 0 },
      { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
    ]);

    if (host.length === 0) {
      return res
        .status(200)
        .json({ status: true, message: 'No data found !', host: [] });
    }

    return res.status(200).json({
      status: true,
      message: 'success',
      host,
      // host: [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Server Error',
      user: '',
    });
  }
};
