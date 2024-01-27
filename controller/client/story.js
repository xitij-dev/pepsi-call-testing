const fs = require('fs');
const moment = require('moment');
const { default: mongoose } = require('mongoose');
const Host = require('../../model/host');
const Story = require('../../model/story');
const VipPlanHistory = require('../../model/vipPlanHistory');

exports.createStory = async (req, res) => {
  try {
    if (!req.body.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req.body.hostId).populate(
      'countryId',
      'name flag'
    );

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }
    const story = new Story();

    const hostDetail = {
      hostId: host?._id,
      name: host?.name,
      image: host?.profilePic,
      country: host?.countryId?.name,
      flag: host?.countryId?.flag,
    };
    story.preview = req?.files.preview
      ? process?.env?.BASE_URL + req?.files.preview[0].path
      : null;
    story.story = process?.env?.BASE_URL + req.files.story[0].path;
    story.hostId = hostDetail;
    story.type = req?.body?.type;
    story.expiresAt = moment().add(24, 'hours');
    await story.save();

    const miliSecond =
      moment(story.expiresAt).diff(moment(), 'millisecond') + 50000;
    console.log(miliSecond);
    setTimeout(() => {
      const preview_ = story?.preview?.split('storage');
      if (preview_) {
        if (fs.existsSync(`storage${preview_[1]}`)) {
          fs.unlinkSync(`storage${preview_[1]}`);
        }
      }
      const image_ = story?.story?.split('storage');
      if (image_) {
        if (fs.existsSync(`storage${image_[1]}`)) {
          fs.unlinkSync(`storage${image_[1]}`);
        }
      }
    }, miliSecond);
    return res
      .status(200)
      .send({ status: true, message: 'story save successfully', story });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Inavalid details' });
    }
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res
        .status(200)
        .send({ status: false, message: 'sotry not exists' });
    }
    const image_ = story?.story?.split('storage');
    if (image_) {
      if (fs.existsSync(`storage${image_[1]}`)) {
        fs.unlinkSync(`storage${image_[1]}`);
      }
    }

    const preview = story?.preview?.split('storage');
    if (preview) {
      if (fs.existsSync(`storage${preview[1]}`)) {
        fs.unlinkSync(`storage${preview[1]}`);
      }
    }

    await story.deleteOne();

    return res
      .status(200)
      .send({ status: true, message: 'delete successfully' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.getStoryByHostId = async (req, res) => {
  try {
    if (!req.params.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const story = await Story.find({ 'hostId.hostId': req.params.hostId });

    return res.status(200).send({ status: true, message: 'success!!', story });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.getAllHostStory = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    let isVip;

    const vipPlan = await VipPlanHistory.findOne({
      userId: req?.query?.userId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
    if (vipPlan && vipPlan.expireDate > moment().toISOString()) {
      isVip = true;
    } else {
      isVip = false;
    }
    const story = await Story.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'storyviews',
          let: {
            user: new mongoose.Types.ObjectId(req?.query?.userId),
            story: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$storyId', '$$story'] },
                    { $eq: ['$userId', '$$user'] },
                  ],
                },
              },
            },
          ],
          as: 'isView',
        },
      },
      {
        $addFields: {
          isvip: isVip,
        },
      },
      {
        $project: {
          hostId: 1,
          preview: 1,
          story: 1,
          type: 1,
          isFake: 1,
          storyType: 1,
          createdAt: 1,
          previewType: 1,
          expiresAt: 1,
          isvip: 1,
          isViewd: {
            $cond: [{ $eq: [{ $size: '$isView' }, 1] }, true, false],
          },
        },
      },
      { $skip: req.query.start ? parseInt(req.query.start) : 0 },
      { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
    ]);

    return res
      .status(200)
      .send({ status: true, message: 'success', response: story });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// add fake story by admin
exports.addFakeStory = async (req, res) => {
  try {
    if (!req.body.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    console.log('vodyyyyyyyyyyyyyyyyyyyyyyyyy', req?.body, req.files);
    const host = await Host.findById(req.body.hostId).populate(
      'countryId',
      'name flag'
    );

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }
    const story = new Story();

    const hostDetail = {
      hostId: host?._id,
      name: host?.name,
      image: host?.profilePic,
      country: host?.countryId?.name,
      flag: host?.countryId?.flag,
    };
    if (req?.body?.storyType == 1) {
      story.story = process?.env?.BASE_URL + req.files.story[0].path;
      story.storyType = req?.body?.storyType;
    }

    if (req?.body?.storyType == 2) {
      story.story = req.body.story;
      story.storyType = req?.body?.storyType;
    }

    if (req?.body?.previewType == 1) {
      story.preview = process?.env?.BASE_URL + req.files.preview[0].path;
      story.previewType = req?.body?.previewType;
    }

    if (req?.body?.previewType == 2) {
      story.preview = req.body.preview;
      story.previewType = req?.body?.previewType;
    }
    story.hostId = hostDetail;
    const splitArray = story?.story?.split('.');

    const fileExtension =
      splitArray && splitArray.length > 0
        ? splitArray[splitArray.length - 1].toLowerCase()
        : '';

    const splitpriewArray = story?.preview?.split('.');

    const Extension =
      splitpriewArray && splitpriewArray.length > 0
        ? splitpriewArray[splitpriewArray.length - 1].toLowerCase()
        : '';

    story.type =
      fileExtension === 'jpeg' ||
      fileExtension === 'jpg' ||
      fileExtension === 'png' ||
      fileExtension === 'webp'
        ? 2
        : 1;

    story.typePrivew =
      Extension === 'jpeg' ||
      Extension === 'jpg' ||
      Extension === 'png' ||
      Extension === 'webp'
        ? 2
        : 1;
    story.isFake = true;
    story.expiresAt = moment().add(24, 'hours');
    await story.save();

    const miliSecond =
      moment(story.expiresAt).diff(moment(), 'millisecond') + 50000;
    console.log(miliSecond);
    setTimeout(() => {
      const preview_ = story?.preview?.split('storage');
      if (preview_) {
        if (fs.existsSync(`storage${preview_[1]}`)) {
          fs.unlinkSync(`storage${preview_[1]}`);
        }
      }
      const image_ = story?.story?.split('storage');
      if (image_) {
        if (fs.existsSync(`storage${image_[1]}`)) {
          fs.unlinkSync(`storage${image_[1]}`);
        }
      }
    }, miliSecond);
    return res
      .status(200)
      .send({ status: true, message: 'story save successfully', story });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: error || 'Internal server error' });
  }
};

// get fake story
exports.getFakeStory = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;
    const story = await Story.aggregate([
      {
        $match: {
          isFake: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          story: [{ $skip: (start - 1) * limit }, { $limit: limit }],
          total: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success',
      story: story[0]?.story,
      total: story[0]?.total[0]?.total || 0,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: error || 'Internal server error' });
  }
};
