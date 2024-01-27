const projectSetting = require('../../model/projectSetting');

// add percentage and amount in project setting
exports.storSetting = async (req, res) => {
  try {
    if (!req?.body?.amountPercentage || !req?.body?.upperAmount) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await projectSetting();
    setting.type = req?.body?.type;
    setting.upperAmount = req?.body?.upperAmount;
    setting.amountPercentage = req?.body?.amountPercentage;
    setting.lowerAmount = req?.body?.lowerAmount || null;

    await setting.save();

    return res
      .status(200)
      .send({ status: true, message: 'Success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all project setting in adminpenal
exports.getAllSetting = async (req, res) => {
  try {
    const setting = await projectSetting.find();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// update project setting
exports.updateSetting = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await projectSetting.findById(req?.params?.id);

    if (!setting) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

    setting.type = req?.body?.type || setting.type;
    setting.amountPercentage =
      req?.body?.amountPercentage || setting.amountPercentage;
    setting.lowerAmount = req?.body?.lowerAmount || setting.lowerAmount;
    setting.upperAmount = req?.body?.upperAmount || setting.upperAmount;

    await setting.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// delete setting
exports.deleteSetting = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await projectSetting.findById(req?.params?.id);

    const AllSetting = await projectSetting.find().countDocuments();
    if (!setting) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

    if (AllSetting > 1) {
      await setting.deleteOne();
    } else {
      return res.status(200).send({
        status: false,
        message: 'last one record cannot be deleted',
      });
    }

    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Interanl server error' });
  }
};
