const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');
const vipPlanHistoryController = require('../../../controller/client/vipPlanHistory');

const route = express.Router();

// user purchase vip plans
route.post(
  '/purchaseVipPlan',
  checkAccess(),
  vipPlanHistoryController.purchaseVipPlan
);
module.exports = route;
