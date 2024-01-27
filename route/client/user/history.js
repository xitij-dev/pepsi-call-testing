const express = require('express');

const route = express.Router();
const HistoryController = require('../../../controller/client/history');
const checkAccessWithSecretKey = require('../../../middleware/checkAccess');

route.post('/makeCall', checkAccessWithSecretKey(), HistoryController.makeCall);

// make video call for fake host
route.post(
  '/makeCallForFakeHost',
  checkAccessWithSecretKey(),
  HistoryController.makeCallForFakeHost
);

// get user all history
route.get('/', checkAccessWithSecretKey(), HistoryController.userCoinHistory);

// get user call history
route.get(
  '/userCallHistory',
  checkAccessWithSecretKey(),
  HistoryController.userCallHistory
);

// get user all hostory for android
route.get(
  '/userCoinHistory',
  checkAccessWithSecretKey(),
  HistoryController.userCoinHistory
);

module.exports = route;
