const moment = require('moment');
const User = require('../../model/user');
const VipPlan = require('../../model/vipPlan');
const VipPlanHistory = require('../../model/vipPlanHistory');

// user purchase vip plan
exports.purchaseVipPlan = async (req, res) => {
  try {
    const { userId, planId } = req?.body;

    if (!userId || !planId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    console.log('req bodyyyyyyyyyyyyyyyyy', req.body);
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    const plan = await VipPlan.findById(planId);
    if (!plan) {
      return res
        .status(200)
        .send({ status: false, message: 'plan not exists' });
    }
    const validDate = moment().add(plan.validity, `${plan.validityType}`);
    const purchaseHistory = new VipPlanHistory();
    purchaseHistory.userId = user._id;
    purchaseHistory.planId = plan._id;
    purchaseHistory.expireDate = validDate.toISOString();
    await purchaseHistory.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', purchaseHistory });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
