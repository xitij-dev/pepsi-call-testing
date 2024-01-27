const express = require('express');

const route = express.Router();
const coinPlanController = require('../../controller/admin/coinPlan');
const checkAccessWithSecretKey = require('../../middleware/checkAccess');

route.post('/', checkAccessWithSecretKey(), coinPlanController.store);

route.patch(
  '/:planId',
  checkAccessWithSecretKey(),
  coinPlanController.updateCoinPlan
);

route.get('/', checkAccessWithSecretKey(), coinPlanController.getCoinPlan);

route.delete(
  '/:planId',
  checkAccessWithSecretKey(),
  coinPlanController.destroy
);

// Active Inactive
route.put(
  '/:planId',
  checkAccessWithSecretKey(),
  coinPlanController.activeInactive
);

// get all purchage history
route.get(
  '/purchasedHistory',
  checkAccessWithSecretKey(),
  coinPlanController.getPurchasedHistory
);

module.exports = route;
