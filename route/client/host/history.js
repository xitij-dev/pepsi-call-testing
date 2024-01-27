const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');
const historyController = require('../../../controller/client/history');

const route = express.Router();

// get host all coin transaction history
route.get('/hostCoin', checkAccess(), historyController.hostCoinHistory);

// get host all call history for [android]
route.get('/hostCallHistory', checkAccess(), historyController.hostCallHistory);

// get all host received gift
route.get('/recevieHostGift', checkAccess(), historyController.recevieHostGift);

// get host sattlment history
route.get(
  '/hostSettlementHistory',
  checkAccess(),
  historyController.hostReedemHistory
);


module.exports = route;
