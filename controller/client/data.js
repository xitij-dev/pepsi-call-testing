const Data = require('../../model/data');

exports.store = async (req, res) => {
  try {
    const data = new Data();
    await data.save();
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server error !' });
  }
};
exports.get = async (req, res) => {
  try {
    const data = await Data.findOne({});

    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server error !' });
  }
};
