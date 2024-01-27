const express = require('express');
const VIPPlanController = require('../../controller/admin/vipPlan');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();

// create vip plan
route.post('/', checkAccess(), VIPPlanController.store);

// update vip plan
route.patch('/:planId', checkAccess(), VIPPlanController.update);

// get all vip plan for admin panel
route.get('/getAllPlan', checkAccess(), VIPPlanController.getAllforAdminpanel);

// delete vip plan
route.delete('/:planId', checkAccess(), VIPPlanController.destroy);

// handeSwitch for active or not vip plan
route.put('/:planId', checkAccess(), VIPPlanController.handleSwitchActive);

module.exports = route;
