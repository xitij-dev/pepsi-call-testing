const User = require('../../model/user');
const Host = require('../../model/host');
const Report = require('../../model/report');

exports.store = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.description || !req?.body?.type) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!!' });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not Exist!!' });
    }

    const report = new Report();

    report.userId = user._id;
    if (!req.body.hostId) {
      report.otherUserId = req?.body?.otherUserId;
    } else {
      report.hostId = req?.body?.hostId;
    }
    report.type = req?.body?.type;
    report.description = req.body.description;

    await report.save();

    return res.status(200).json({ status: true, message: 'Success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// get user report in admin penal
exports.getReportByUser = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;

    const report = await Report.aggregate([
      {
        $match: {
          type: 'user',
          hostId: { $ne: null },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'hosts',
          let: { hostId: '$hostId' },
          as: 'host',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$hostId'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                coin: 1,
                profilePic: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$host',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: '$host._id',
          userName: '$userId.name',
          userImage: '$userId.image',
          userCoin: '$userId.coin',
          hostName: '$host.name',
          coin: '$host.coin',
          hostImage: '$host.profilePic',
          description: 1,
          date: 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 },
          image: { $first: '$hostImage' },
          name: { $first: '$hostName' },
          coin: { $first: '$coin' },
          data: { $push: '$$ROOT' },
        },
      },
      {
        $facet: {
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
          report: [{ $skip: (start - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      total: report[0]?.total[0]?.total > 0 ? report[0]?.total[0]?.total : 0,
      report: report[0]?.report,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get host report in admin penal
exports.getReportByHost = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;

    const report = await Report.aggregate([
      {
        $match: {
          $or: [
            { type: 'host' },
            { $and: [{ type: 'user' }, { otherUserId: { $ne: null } }] },
          ],
        },
      },
      {
        $lookup: {
          from: 'hosts',
          let: { hostId: '$hostId' },
          as: 'host',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$hostId'] } } },
            { $project: { _id: 1, name: 1, coin: 1, profilePic: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { otherUserId: '$otherUserId' },
          as: 'otherUser',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$otherUserId'] } } },
            { $project: { _id: 1, name: 1, coin: 1, profilePic: '$image' } },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          as: 'user',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: { _id: 1, name: 1, coin: 1, profilePic: '$image' } },
          ],
        },
      },
      {
        $addFields: {
          main: {
            $cond: [
              { $eq: ['$type', 'host'] },
              { $arrayElemAt: ['$user', 0] },
              { $arrayElemAt: ['$otherUser', 0] },
            ],
          },
          other: {
            $cond: [
              { $eq: ['$type', 'host'] },
              { $arrayElemAt: ['$host', 0] },
              { $arrayElemAt: ['$user', 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$main._id',
          name: { $first: '$main.name' },
          image: { $first: '$main.profilePic' },
          coin: { $first: '$main.coin' },
          count: { $sum: 1 },
          data: {
            $push: {
              _id: '$other._id',
              hostCoin: '$other.coin',
              hostName: '$other.name',
              type: '$type',
              hostImage: '$other.profilePic',
              description: '$description',
              userImage: '$main.profilePic',
              userName: '$main.name',
              coin: '$main.coin',
              date: '$date',
            },
          },
        },
      },
      {
        $facet: {
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
          report: [{ $skip: (start - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      total: report[0]?.total[0]?.total > 0 ? report[0]?.total[0]?.total : 0,
      report: report[0]?.report,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: 'Internal server error' });
  }
};
