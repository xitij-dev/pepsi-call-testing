const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');
const VipPlanController = require('../../../controller/admin/vipPlan');

const route = express.Router();

// get all vip plan for android  
route.get('/', checkAccess(), VipPlanController.getAllVipPlan);

module.exports = route;
