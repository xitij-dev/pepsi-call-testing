const express = require('express');
const liveStramingHistoryController = require('../../controller/admin/liveStreamingHistory');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();

// get host live streaming history
route.get('/', checkAccess(), liveStramingHistoryController.hostAllHistory);

module.exports = route;
