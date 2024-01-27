const Story = require('../../model/story');
const StoryView = require('../../model/storyView');
const User = require('../../model/user');

exports.storeView = async (req, res) => {
  try {
    if (!req.body.storyId || !req.body.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const story = await Story.findById(req.body.storyId);

    if (!story) {
      return res
        .status(200)
        .send({ status: false, message: 'story not exists' });
    }

    const user = await User.findById(req.body.userId);

    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    const view = await StoryView.findOne({
      storyId: story._id,
      userId: user._id,
    });
    if (view) {
      return res.status(200).send({ status: true, message: 'success', view });
    }
    const storyview = new StoryView();

    storyview.storyId = story._id;
    storyview.userId = user._id;

    await storyview.save();

    return res
      .status(200)
      .send({ status: true, message: 'success', view: storyview });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.getView = async (req, res) => {
  try {
    if (!req.query.storyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const view = await StoryView.aggregate([
      { $match: { storyId: req.query.storyId } },
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
        $project: {
          _id: 0,
          name: '$user.name',
          image: '$user.image',
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      view,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};
