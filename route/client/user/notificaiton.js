const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');
const notificationController = require('../../../controller/admin/notification');

const route = express.Router();

// get notification
route.get(
  '/getUserWiseNotification',
  checkAccess(),
  notificationController.getUserWiseNotification
);
module.exports = route;
