const fs = require('fs');
const Gift = require('../../model/gift');
const Category = require('../../model/giftCategory');
// create category
exports.store = async (req, res) => {
  try {
    if (!req.file || !req.body.name) {
 return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!' });
}

    const category = new Category();

    category.image = req.file.path;
    category.name = req.body.name;

    await category.save();

    return res.status(200).json({
      status: true,
      message: 'Success!',
      category,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// update category
exports.update = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: 'Category does not Exist!' });
    }
    if (req.file) {
      if (fs.existsSync(category.image)) {
        fs.unlinkSync(category.image);
      }

      category.image = req.file.path;
    }
    category.name = req.body.name;

    await category.save();

    return res.status(200).json({
      status: true,
      message: 'Success!',
      category,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// delete category
exports.destroy = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
 return res
        .status(200)
        .json({ status: false, message: 'Category does not Exist!' });
}

    if (fs.existsSync(category.image)) {
      fs.unlinkSync(category.image);
    }

    const gift = await Gift.find({ category: category._id });

    await gift.map(async (data) => {
      if (fs.existsSync(data.image)) {
        fs.unlinkSync(data.image);
      }
      await data.deleteOne();
    });

    await category.deleteOne();

    return res.status(200).json({ status: true, message: 'Success!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// get all category For backend
exports.allCategory = async (req, res) => {
  try {
    const category = await Category.aggregate([
      {
        $lookup: {
          from: 'gifts',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'gift',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          name: 1,
          image: 1,
          createdAt: 1,
          isActive: 1,
          giftCount: { $size: '$gift' },
        },
      },
    ]);

    if (!category) { return res.status(200).json({ status: false, message: 'No data found!' }); }

    return res.status(200).json({
      status: true,
      message: 'Success!!',
      category,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// Handle Active Inactive Category
exports.handleToggle = async (req, res) => {
  try {
    if (!req.params.categoryId) {
      return res
        .status(200)
        .json({ status: false, message: 'Category Id is required !' });
    }

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: 'Category does not exists !' });
    }

    category.isActive = !category.isActive;

    await category.save();

    return res.status(200).json({
      status: true,
      message: 'success',
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};
