const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();
const liveStreamingController = require('../../../controller/client/liveStreaming');


// get getStreamingSummary
route.get(
  '/',
  checkAccess(),
  liveStreamingController.getStreamingSummary
);

module.exports = route;
