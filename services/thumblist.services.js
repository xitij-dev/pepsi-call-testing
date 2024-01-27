const dayjs = require('dayjs');
const mongoose = require('mongoose');
const ChatTopic = require('../model/chatTopic');
const User = require('../model/user');
const Host = require('../model/host');
const Block = require('../model/block');
const Chat = require('../model/chat');

// Get Thumb List of chat
exports.getChatThumbList = async (query) => {
  try {
    if (!query.type) {
      return { status: 'false', message: 'Type is required !' };
    }

    if (!query.userId) {
      return { status: false, message: 'User Id is required !' };
    }

    let user;
    let matchQuery;
    let lookupMatch;
    let unwindMatch;
    let projectMatch;
    let size;
    let match;
    let topicMatch;

    if (query.topicId) {
      topicMatch = {
        _id: { $eq: mongoose.Types.ObjectId(query.topicId) },
        chat: { $ne: null },
      };
    } else {
      topicMatch = { _id: { $ne: null }, chat: { $ne: null } };
    }

    if (query.search) {
      match = { name: { $regex: query.search, $options: 'i' } };
    } else {
      match = {};
    }
    const projectQuery = {
      _id: 0,
      total: 1,
      topic: '$list.topic',
      message: '$list.message',
      date: '$list.date',
      chatDate: '$list.chatDate',
      name: '$list.name',
      bio: '$list.bio',
      image: '$list.image',
      profileImage: '$list.profileImage',
      country: '$list.country',
      isOnline: '$list.isOnline',
      count: '$list.count',
    };

    if (query.type === 'user') {
      projectQuery.hostId = '$list.hostId';
    } else {
      projectQuery.userId = '$list.userId';
    }

    // This type checking is mandatory because in this app user and host both apps are different so in host app we have to show user thumb list and in user app we have to show host thumb list
    if (query.type === 'user') {
      user = await User.findById(query.userId);

      const blockHost = await Block.find({ userId: user._id }).distinct(
        'hostId'
      );
      const approveHost = await Host.find({ isApproved: true }).distinct('_id');

      // size = await ChatTopic.find({
      //   userId: user._id,
      //   hostId: { $in: approveHost },
      //   hostId: { $nin: blockHost },
      //   chat: { $ne: null },
      // }).countDocuments();

      if (!user) {
        return { status: false, message: 'User does not Exist!' };
      }

      matchQuery = {
        userId: user._id,
      };

      lookupMatch = {
        $lookup: {
          from: 'hosts',
          as: 'host',
          let: { hostId: '$hostId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$hostId'],
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$isBlock', false],
                },
              },
            },
            {
              $match: {
                $expr: { $in: ['$_id', approveHost] },
              },
            },
            {
              $match: {
                $expr: { $not: { $in: ['$_id', blockHost] } },
              },
            },

            {
              $project: {
                name: 1,
                image: 1,
                profileImage: 1,
                country: 1,
                bio: 1,
                isOnline: 1,
              },
            },
          ],
        },
      };

      unwindMatch = {
        $unwind: {
          path: '$host',
          preserveNullAndEmptyArrays: false,
        },
      };

      projectMatch = {
        $project: {
          _id: 0,
          topic: '$_id',
          message: '$chat.message',
          date: '$chat.date',
          chatDate: {
            $dateFromString: {
              dateString: '$chat.date',
            },
          },
          hostId: '$host._id',
          name: '$host.name',
          bio: '$host.bio',
          image: '$host.image',
          profileImage: '$host.profileImage',
          country: '$host.country',
          isOnline: '$host.isOnline',
          // count: { $size: "$allChat" },
        },
      };
    } else if (query.type === 'host') {
      user = await Host.findById(query.userId);

      const blockUser = await Block.find({ hostId: user._id }).distinct(
        'userId'
      );

      // size = await ChatTopic.find({
      //   hostId: user._id,
      //   userId: { $nin: blockUser },
      //   chat: { $ne: null },
      // }).countDocuments();

      if (!user) {
        // eslint-disable-next-line no-undef
        return res
          .status(200)
          .json({ status: false, message: 'Host does not Exist!' });
      }

      matchQuery = {
        hostId: user._id,
      };

      lookupMatch = {
        $lookup: {
          from: 'users',
          as: 'user',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userId'],
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$isBlock', false],
                },
              },
            },
            {
              $match: {
                $expr: { $not: { $in: ['$_id', blockUser] } },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
                image: 1,
                country: 1,
                bio: 1,
                isOnline: 1,
              },
            },
          ],
        },
      };

      unwindMatch = {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      };

      projectMatch = {
        $project: {
          _id: 0,
          topic: '$_id',
          message: '$chat.message',
          date: '$chat.date', //
          chatDate: {
            // sorting date
            $dateFromString: {
              dateString: '$chat.date',
            },
          },
          userId: '$user._id',
          name: '$user.name',
          username: '$user.username',
          bio: '$user.bio',
          image: '$user.image',
          country: '$user.country',
          isOnline: '$user.isOnline',
          // count: { $size: "$allChat" },
        },
      };
    }

    const list = await ChatTopic.aggregate([
      {
        $match: topicMatch,
      },
      {
        $match: matchQuery,
      },
      lookupMatch,
      unwindMatch,
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chat',
        },
      },
      {
        $unwind: {
          path: '$chat',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $lookup: {
      //     from: "chats",
      //     let: { topic: "$_id" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$topic", "$$topic"] },
      //               { $ne: ["$senderId", query.userId] },
      //               { $eq: ["$isRead", false] },

      //             ],
      //           },
      //         },
      //       },
      //     ],
      //     as: "allChat",
      //   },
      // },
      projectMatch,
      { $addFields: { count: 0 } },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          list: { $push: '$$ROOT' },
        },
      },
      { $unwind: { path: '$list', preserveNullAndEmptyArrays: true } },
      { $project: projectQuery },
      { $sort: { chatDate: -1 } },
      { $match: match },

      {
        $facet: {
          chatList: [
            { $skip: query.start ? parseInt(query.start) : 0 },
            { $limit: query.limit ? parseInt(query.limit) : 20 },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
          ],
        },
      },
    ]);

    const now = dayjs().tz('Australia/Sydney');

    const chatList = list[0].chatList.map((data) => ({
      ...data,
      time:
        now.diff(data.date, 'minute') <= 60 &&
        now.diff(data.date, 'minute') >= 0
          ? `${now.diff(data.date, 'minute')} minutes ago`
          : now.diff(data.date, 'hour') >= 24
          ? dayjs(data.date).format('DD MMM, YYYY')
          : `${now.diff(data.date, 'hour')} hour ago`,
    }));

    return {
      status: true,
      message: 'Success!!',
      chatList,
      size: list[0].pageInfo.length > 0 ? list[0].pageInfo[0].totalRecord : 0,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      error: error.message || 'Server Error',
    };
  }
};
