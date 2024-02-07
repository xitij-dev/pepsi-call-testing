const express = require('express');
const historyController = require('../../controller/client/history');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();

// api for host history for admin penal
route.get('/hisotryForHost', checkAccess(), historyController.hisotryForHost);

// api for user history for admin penal
route.get('/historyForUser', checkAccess(), historyController.historyForUser);

// get user call history for admin penal
route.get(
  '/callHistoryForUser',
  checkAccess(),
  historyController.callHistoryForUser
);

// get agency history for host wise
route.get(
  '/agencyHistory',
  checkAccess(),
  historyController.agencyHistoryOfHostWise
);
module.exports = route;

// get agency history for host wise
route.get(
  '/makeCallLoopFunction',
  checkAccess(),
  historyController.makeCallLoopFunction
);
module.exports = route;
