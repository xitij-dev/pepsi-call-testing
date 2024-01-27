const shuffle = require('shuffle-array');
const VipFlashCoin = require('../../model/vipFlashCoin');

exports.getVipFlashCoin = async (req, res) => {
  try {
    const vipPlan = await VipFlashCoin.find().sort({ createdAt: -1 });

    return res
      .status(200)
      .send({ status: true, message: 'Success!!', response: vipPlan });
  } catch (error) {
    return res.status(500);
  }
};

exports.store = async (req, res) => {
  try {
    if (
      !req.body.validity ||
      !req.body.validityType ||
      !req.body.dollar ||
      !req.body.rupee ||
      !req.body.productKey
    ) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!' });
    }

    const vipFlashCoin = new VipFlashCoin();
    vipFlashCoin.name = req.body?.name;
    vipFlashCoin.tag = req.body.tag ? req.body.tag : '';
    vipFlashCoin.validity = req.body.validity;
    vipFlashCoin.validityType = req.body.validityType;
    vipFlashCoin.dollar = req.body.dollar;
    vipFlashCoin.rupee = req.body.rupee;
    vipFlashCoin.productKey = req.body.productKey;
    await vipFlashCoin.save();

    return res
      .status(200)
      .json({ status: true, message: 'Success!', vipFlashCoin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// get coinplan for android
exports.getPlan = async (req, res) => {
  try {
    const plan = await VipFlashCoin.find({
      isActive: true,
      isDelete: false,
    }).sort({
      createdAt: -1,
    });

    const data = [];
    for (let index = 0; index < plan.length; index += 1) {
      const ele = plan[index];
      const obj = {
        _id: ele?._id,
        createdAt: ele?.createdAt,
        updatedAt: ele?.updatedAt,
        tag: ele?.tag,
        coin: ele?.coin,
        discount: ele?.discount,
        rupee: ele?.rupee,
        isActive: ele?.isActive,
        dollar: ele?.dollar,
        productKey: ele?.productKey,
        isDelete: false,
        name: ele?.name,
        validity: ele?.validity,
        validityType: ele?.validityType,
      };

      data.push(obj);
    }
    shuffle(data);
    return res.status(200).send({ status: true, message: 'success!!', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// update vip plan
exports.updateFlashCoin = async (req, res) => {
  try {
    const vipFlashCoin = await VipFlashCoin.findById(req.params.planId);

    if (!vipFlashCoin) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not Exist!' });
    }

    if (req.body.name) {
      vipFlashCoin.name = req.body.name;
    }
    vipFlashCoin.validity = req?.body?.validity
      ? req?.body?.validity
      : vipFlashCoin.validity;
    vipFlashCoin.validityType = req?.body?.validityType
      ? req?.body?.validityType
      : vipFlashCoin.validityType;
    vipFlashCoin.dollar = req?.body?.dollar
      ? req?.body?.dollar
      : vipFlashCoin.dollar;
    vipFlashCoin.rupee = req?.body?.rupee
      ? req?.body?.rupee
      : vipFlashCoin.rupee;
    vipFlashCoin.tag = req?.body?.tag || '';
    vipFlashCoin.productKey = req?.body?.productKey
      ? req?.body?.productKey
      : vipFlashCoin.productKey;
    await vipFlashCoin.save();

    return res
      .status(200)
      .json({ status: true, message: 'Success!', vipFlashCoin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

exports.activeEnableDeseble = async (req, res) => {
  try {
    const vipFlashCoin = await VipFlashCoin.findById(req.params.planId);

    vipFlashCoin.isActive = !vipFlashCoin.isActive;

    await vipFlashCoin.save();

    return res.status(200).json({
      status: true,
      message: 'success!!',
      response: vipFlashCoin,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.destroy = async (req, res) => {
  try {
    if (!req.params.planId) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan Id is required !' });
    }

    const vipFlashCoin = await VipFlashCoin.findById(req.params.planId);

    await vipFlashCoin.deleteOne();
    return res
      .status(200)
      .json({ status: true, message: 'Deleted successfully ' });
  } catch (error) {
    return res.status(500);
  }
};
