const VIPPlan = require('../../model/vipPlan');

// create vip plan
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

    const vipPlan = new VIPPlan();

    vipPlan.name = req.body.name;
    vipPlan.validity = req.body.validity;
    vipPlan.validityType = req.body.validityType;
    vipPlan.dollar = req.body.dollar;
    vipPlan.rupee = req.body.rupee;
    vipPlan.tag = req.body.tag;
    vipPlan.productKey = req.body.productKey;

    await vipPlan.save();

    return res.status(200).json({ status: true, message: 'Success!', vipPlan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// update vip plan
exports.update = async (req, res) => {
  try {
    const vipPlan = await VIPPlan.findById(req.params.planId);

    if (!vipPlan) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not Exist!' });
    }

    if (req.body.name) {
      vipPlan.name = req.body.name;
    }

    vipPlan.validity = req?.body?.validity
      ? req?.body?.validity
      : vipPlan.validity;
    vipPlan.validityType = req?.body?.validityType
      ? req?.body?.validityType
      : vipPlan.validityType;
    vipPlan.dollar = req?.body?.dollar ? req?.body?.dollar : vipPlan.dollar;
    vipPlan.rupee = req?.body?.rupee ? req?.body?.rupee : vipPlan.rupee;
    vipPlan.tag = req?.body?.tag || '';
    vipPlan.productKey = req?.body?.productKey
      ? req?.body?.productKey
      : vipPlan.productKey;

    await vipPlan.save();

    return res.status(200).json({ status: true, message: 'Success!', vipPlan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};

// get all vip plan in admin panel
exports.getAllforAdminpanel = async (req, res) => {
  try {
    const start = req?.query?.start || 1;
    const limit = req?.query?.limit || 20;
    const vipplan = await VIPPlan.find({ isDelete: false })
      .skip((start - 1) * limit)
      .limit(limit);

    const total = await VIPPlan.find({ isDelete: false }).countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', total, vipplan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all vip plan for android
exports.getAllVipPlan = async (req, res) => {
  try {
    const vipplan = await VIPPlan.find({ isDelete: false, isActive: true });

    const data = [];
    for (let index = 0; index < vipplan.length; index += 1) {
      const ele = vipplan[index];

      const obj = {
        _id: ele._id,
        createdAt: ele.createdAt,
        updatedAt: ele.updatedAt,
        name: ele.name,
        validity: ele.validity,
        validityType: ele.validityType,
        tag: ele.tag,
        coin: 0,
        rupee: ele.rupee,
        isActive: ele.isActive,
        dollar: ele.dollar,
        productKey: ele.productKey,
        extraCoin: 0,
        discount: 0,
        rupeeWithDiscount: 0,
        image: '',
        isDelete: ele.isDelete,
      };

      data.push(obj);
    }
    return res.status(200).send({ status: true, message: 'success!!', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
// delete vipPlan
exports.destroy = async (req, res) => {
  try {
    const vipPlan = await VIPPlan.findById(req.params.planId);

    if (!vipPlan) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not Exist!' });
    }

    vipPlan.isDelete = true;

    await vipPlan.save();

    return res.status(200).json({ status: true, message: 'Success!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};
// active or deactive plan
exports.handleSwitchActive = async (req, res) => {
  try {
    const vipPlan = await VIPPlan.findById(req.params.planId);

    if (!vipPlan) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan does not Exist!' });
    }

    vipPlan.isActive = !vipPlan.isActive;

    await vipPlan.save();

    return res.status(200).json({ status: true, message: 'Success!', vipPlan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};
