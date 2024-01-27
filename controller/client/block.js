const User = require('../../model/user');
const Host = require('../../model/host');
const Block = require('../../model/block');
// Block unblock User or Host
exports.blockUnblock = async (req, res) => {
  try {
    if (!req.body || !req.body.type || !req.body.userId || !req.body.hostId) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details !' });
    }

    const user = await User.findById(req.body.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not exists !' });
    }

    const host = await Host.findById(req.body.hostId);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'Host does not exists !' });
    }

    const blocks = await Block.findOne({
      $and: [
        {
          userId: user._id,
          hostId: host._id,
          type: req.body.type,
        },
      ],
    });

    if (blocks) {
      await Block.deleteOne({
        userId: user._id,
        hostId: host._id,
        type: req.body.type,
      });

      return res.status(200).send({
        status: true,
        message: 'Unblocked Successfully ',
        isBlock: false,
      });
    }
    const block = await Block();

    block.userId = user._id;
    block.hostId = host._id;
    block.type = req.body.type;

    await block.save();

    return res
      .status(200)
      .json({ status: true, message: 'Blocked Successfully', isBlock: true });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

exports.toUserList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Inavalid details' });
    }

    const data = await Block.aggregate([
      {
        $match: {
          userId: req.query.userId,
          type: 'user',
        },
      },
      {
        $lookup: {
          from: 'hosts',
          localField: 'hostId',
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
        $project: {
          '$host.name': 1,
          '$host.profilePic': 1,
          '$host._id': 1,
          '$host.gender': 1,
          '$host.country': 1,
        },
      },
    ]);

    return res.status(200).send({ status: true, message: 'success!!', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.toHostList = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Inavalid details' });
    }

    const data = await Block.aggregate([
      {
        $match: {
          hostId: req.query.hostId,
          type: 'host',
        },
      },
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
          path: 'user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          '$user.name': 1,
          '$user.image': 1,
          'user.gender': 1,
          '$user.country': 1,
          '$user._id': 1,
        },
      },
    ]);

    return res.status(200).send({ status: true, message: 'Success!!', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};
