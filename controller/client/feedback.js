/* eslint-disable prefer-template */
/* eslint-disable one-var */
/* eslint-disable no-shadow */
const dayjs = require('dayjs');
const fs = require('fs');
const FCM = require('fcm-node');
const utc = require('dayjs/plugin/utc');
const moment = require('moment');
const moments = require('moment-timezone');
const timezone = require('dayjs/plugin/timezone');
const User = require('../../model/user');
const Feedback = require('../../model/feedback');
const Host = require('../../model/host');
const Notification = require('../../model/notification');

const fcm = new FCM(process?.env?.SERVER_KEY);
dayjs.extend(timezone);
dayjs.extend(utc);

exports.store = async (req, res) => {
  try {
    if (
      !req.body.description ||
      !req.body.contact ||
      !req.body.userId ||
      !req.body.type
    ) {
      return res.status(200).json({
        status: false,
        message: 'Invalid Details',
      });
    }

    const user = await User.findById(req.body.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User Not Found !' });
    }

    const feedback = new Feedback();

    if (req.file) {
      feedback.screenshot = req.file.path;
    }

    feedback.userId = user._id;
    feedback.type = parseInt(req.body.type);
    feedback.description = req.body.description;
    feedback.contact = req.body.contact;
    feedback.date = moment().format();

    await feedback.save();

    return res.status(200).json({
      status: true,
      message: 'Success',
      feedback,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// Create Feedback
exports.storeHostFeedback = async (req, res) => {
  try {
    if (
      !req.body.description ||
      !req.body.contact ||
      !req.body.hostId ||
      !req.body.type
    ) {
      return res.status(200).json({
        status: false,
        message: 'Invalid Details',
      });
    }

    const host = await Host.findById(req.body.hostId);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'host Not Found !' });
    }

    const feedback = new Feedback();

    if (req.file) {
      feedback.screenshot = req.file.path;
    }
    feedback.hostId = host._id;
    feedback.type = parseInt(req.body.type);
    feedback.description = req.body.description;
    feedback.contact = req.body.contact;
    feedback.date = moment().format();
    await feedback.save();

    return res.status(200).json({
      status: true,
      message: 'Success',
      feedback,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: 'userId is required' });
    }
    let lookupQuery;
    let matchQuery;

    const user = await User.findById(req.query.userId);

    // eslint-disable-next-line prefer-const
    lookupQuery = {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    };

    // eslint-disable-next-line prefer-const
    matchQuery = { userId: user._id };

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User Not Found !' });
    }

    const feedback = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $lookup: lookupQuery,
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },

      {
        $project: {
          description: 1,
          screenshot: 1,
          contact: 1,
          type: 1,
          isSolved: 1,
          adminDescription: 1,
          date: 1,
          createdAt: 1,
          image: '$user.image',
          name: '$user.name',
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const now = dayjs().tz('Asia/Kolkata');
    // const feedbackList = feedback.map((data) => ({
    //   ...data,
    //   time:
    //     now.diff(data.createdAt, 'minute') <= 60 &&
    //     now.diff(data.createdAt, 'minute') >= 0
    //       ? `${now.diff(data.createdAt, 'minute')} minutes ago`
    //       : now.diff(data.createdAt, 'hour') >= 24
    //       ? dayjs(data.createdAt).format('DD MMM, YYYY')
    //       : `${now.diff(data.createdAt, 'hour')} hour ago`,
    // }));

    const feedbackList = feedback.map((data) => {
      const timeDiffMinutes = now.diff(data.createdAt, 'minute');
      const timeDiffHours = now.diff(data.createdAt, 'hour');

      let time;
      if (timeDiffMinutes <= 1 || timeDiffHours === 0) {
        time = 'Just now';
      } else if (timeDiffMinutes <= 60) {
        time = `${timeDiffMinutes} minutes ago`;
      } else if (timeDiffHours >= 24) {
        time = dayjs(data.createdAt).format('DD MMM, YYYY');
      } else {
        time = `${timeDiffHours} hour${timeDiffHours > 1 ? 's' : ''} ago`;
      }

      return {
        ...data,
        time,
      };
    });

    return res.status(200).json({
      status: true,
      message: 'success',
      // feedback: [],
      feedback: feedbackList,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

exports.gethostfeedback = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .json({ status: false, message: 'hostId is required' });
    }
    let lookupQuery;
    let matchQuery;

    const host = await Host.findById(req.query.hostId);

    // eslint-disable-next-line prefer-const
    lookupQuery = {
      from: 'hosts',
      localField: 'hostId',
      foreignField: '_id',
      as: 'host',
    };

    // eslint-disable-next-line prefer-const
    matchQuery = { hostId: host._id };

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'host Not Found !' });
    }

    const feedback = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $lookup: lookupQuery,
      },
      { $unwind: { path: '$host', preserveNullAndEmptyArrays: false } },

      {
        $project: {
          description: 1,
          screenshot: 1,
          contact: 1,
          type: 1,
          isSolved: 1,
          date: 1,
          createdAt: 1,
          image: '$host.profilePic',
          name: '$host.name',
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const now = dayjs().tz('Asia/Kolkata');
    const feedbackList = feedback.map((data) => {
      const timeDiffMinutes = now.diff(data.createdAt, 'minute');
      const timeDiffHours = now.diff(data.createdAt, 'hour');

      let time;
      if (timeDiffMinutes <= 1 || timeDiffHours === 0) {
        time = 'Just now';
      } else if (timeDiffMinutes <= 60) {
        time = `${timeDiffMinutes} minutes ago`;
      } else if (timeDiffHours >= 24) {
        time = dayjs(data.createdAt).format('DD MMM, YYYY');
      } else {
        time = `${timeDiffHours} hour${timeDiffHours > 1 ? 's' : ''} ago`;
      }

      return {
        ...data,
        time,
      };
    });
    return res.status(200).json({
      status: true,
      message: 'success',
      // feedback: [],
      feedback: feedbackList,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res
        .status(200)
        .send({ status: false, message: 'feedback not exists' });
    }
    feedback.adminDescription = req?.body?.adminDescription;
    feedback.isSolved = true;

    await feedback.save();
    let user;
    let Fcm;
    if (feedback.userId != null) {
      user = await User.findById(feedback.userId);
      Fcm = user.fcmToken;
    } else {
      user = await Host.findById(feedback.hostId);
      Fcm = user.fcm_token;
    }

    const payload = {
      to: Fcm,
      notification: {
        body: req.body.adminDescription,
        title: 'your feedback solved by admin',
      },
    };

    await fcm.send(payload, async (err, res) => {
      if (err) {
        console.log('somthing went erong', err);
      }
      const notification = new Notification();
      if (feedback.userId != null) {
        notification.userId = user._id;
        notification.type = 'user';
      } else {
        notification.hostId = user._id;
        notification.type = 'host';
      }
      notification.notificationType = 1;
      notification.message = req?.body?.adminDescription;
      notification.title = 'your feedback solved by admin';

      await notification.save();
    });

    return res
      .status(200)
      .send({ status: true, message: 'success!!', feedback });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res
        .status(200)
        .send({ status: false, message: 'feedback not exists' });
    }

    if (fs.existsSync(feedback.screenshot)) {
      fs.unlinkSync(feedback.screenshot);
    }

    await feedback.deleteOne();

    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all user feedback for admin panel
exports.getAllFeedbackForUser = async (req, res) => {
  try {
    // eslint-disable-next-line no-shadow
    const start = req?.query?.start ? parseInt(req?.query?.start) : 1;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit) : 20;

    let query;
    let searching;

    let dateFilterQuery = {};
    if (req?.query?.startDate !== 'ALL' && req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        analyticDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    if (req?.query?.search != 'ALL') {
      searching = {
        'user.name': { $regex: req?.query?.search, $options: 'i' },
      };
    } else {
      searching = {
        'user._id': { $ne: null },
      };
    }
    if (req?.query?.type === 'solved') {
      query = {
        isSolved: true,
      };
    } else if (req?.query?.type === 'pending') {
      query = {
        isSolved: false,
      };
    }

    const data = await Feedback.aggregate([
      {
        $match: { ...query, userId: { $ne: null } },
      },
      {
        $addFields: {
          analyticDate: {
            $toDate: '$date',
          },
        },
      },
      { $match: dateFilterQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: searching,
      },
      {
        $project: {
          id: '$user._id',
          name: '$user.name',
          image: '$user.image',
          country: '$user.country',
          screenshot: 1,
          description: 1,
          adminDescription: 1,
          contact: 1,
          type: 1,
          date: 1,
          isSolved: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Feedback.find({
      ...query,
      userId: { $ne: null },
    }).countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', total, data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all host feedback for admin panel
exports.getAllHostFeedback = async (req, res) => {
  try {
    const start = req?.query?.start ? parseInt(req?.query?.start) : 1;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit) : 20;
    let query;
    let searching;

    let dateFilterQuery = {};
    if (req?.query?.startDate !== 'ALL' && req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        analyticDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    if (req?.query?.type === 'solved') {
      query = {
        isSolved: true,
      };
    } else if (req?.query?.type === 'pending') {
      query = {
        isSolved: false,
      };
    }

    if (req?.query?.search != 'ALL') {
      searching = {
        'host.name': { $regex: req?.query?.search, $options: 'i' },
      };
    } else {
      searching = {
        'host._id': { $ne: null },
      };
    }

    const data = await Feedback.aggregate([
      {
        $match: { ...query, hostId: { $ne: null } },
      },
      {
        $addFields: {
          analyticDate: {
            $toDate: '$date',
          },
        },
      },
      { $match: dateFilterQuery },
      {
        $lookup: {
          from: 'hosts',
          localField: 'hostId',
          foreignField: '_id',
          as: 'host',
          pipeline: [
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
        $match: searching,
      },
      {
        $project: {
          id: '$host._id',
          name: '$host.name',
          image: '$host.profilePic',
          country: '$host.countryId.name',
          screenshot: 1,
          description: 1,
          adminDescription: 1,
          contact: 1,
          type: 1,
          date: 1,
          isSolved: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Feedback.find({
      ...query,
      hostId: { $ne: null },
    }).countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', total, data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
