const fs = require('fs');
const Category = require('../../model/giftCategory');
const Gift = require('../../model/gift');
// get all Category gift
exports.index = async (req, res) => {
  try {
    const gift = await Category.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $lookup: {
          from: 'gifts',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'gift',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'Success!!',
      gift,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// store multiple gift
exports.store = async (req, res) => {
  try {
    if (!req.body.coin || !req.files || !req.body.categoryId) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!' });
    }

    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: 'Category does not Exist!' });
    }

    // eslint-disable-next-line no-shadow
    const gift = req.files.map((gift) => ({
      image: gift.path,
      coin: req.body.coin,
      categoryId: category._id,
      type: gift.mimetype === 'image/gif' ? 1 : 0,
    }));

    const gifts = await Gift.insertMany(gift);

    // const data = [];

    // for (let i = 0; i < gifts.length; i += 1) {
    //   data.push(
    //     await Gift.findById(gifts[i]._id).populate('categoryId', 'name')
    //   );
    // }

    return res.status(200).json({
      status: true,
      message: 'Success!',
      gift: gifts,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// update gift
exports.update = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.giftId);

    if (!gift) {
      return res
        .status(200)
        .json({ status: false, message: 'Gift does not Exist!' });
    }
    if (req.file) {
      if (fs.existsSync(gift.image)) {
        fs.unlinkSync(gift.image);
      }
      gift.type = req.file.mimetype === 'image/gif' ? 1 : 0;
      gift.image = req.file.path;
    }
    gift.coin = req.body.coin;
    gift.categoryId = req.body.categoryId
      ? req.body.categoryId
      : gift.categoryId;

    await gift.save();

    // const data = await Gift.findById(gift._id).populate('categoryId', 'name');

    return res.status(200).json({
      status: true,
      message: 'Success!',
      gift,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// delete gift
exports.destroy = async (req, res) => {
  try {
    if (!req.params.giftId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const gift = await Gift.findById(req.params.giftId);

    if (!gift) {
      return res
        .status(200)
        .send({ status: false, message: 'gift not exists' });
    }
    if (fs.existsSync(gift.image)) {
      fs.unlinkSync(gift.image);
    }

    await gift.deleteOne();

    return res
      .status(200)
      .send({ status: true, message: 'successfully deleted' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

// get category wise gifts
exports.categoryWiseGift = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res
        .status(200)
        .json({ status: false, message: 'Category Id is required !' });
    }

    const category = await Category.findOne({
      _id: req.query.categoryId,
      isActive: true,
    });

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: 'Category does not Exist!' });
    }

    const gift = await Gift.aggregate([
      {
        $match: {
          $and: [{ categoryId: { $eq: category._id } }],
        },
      },
      {
        $addFields: { count: 0 }, // patiyu
      },
      { $sort: { createdAt: -1 } },
    ]);
    if (!gift) {
      return res.status(200).json({ status: false, message: 'No data found!' });
    }

    return res.status(200).json({
      status: true,
      message: 'Success!!',
      gift,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// get gift for category wise for android
exports.categoryWiseForAndroid = async (req, res) => {
  try {
    const gift = await Category.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $lookup: {
          from: 'gifts',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'gifts',
        },
      },
    ]);
    if (gift.length == 0) {
      return res.status(200).send({ status: false, message: 'gift not found' });
    }
    return res.status(200).send({ status: true, message: 'success!!', gift });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};
