const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');
const notificationController = require('../../../controller/admin/notification');

const route = express.Router();

// get host wise notification
route.get('/', checkAccess(), notificationController.getHostWiseNotification);
module.exports = route;
