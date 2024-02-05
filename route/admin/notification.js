const express = require('express');
const multer = require('multer');
const checkAccess = require('../../middleware/checkAccess');
const notificationCntroller = require('../../controller/admin/notification');

const storage = require('../../middleware/multer');

const upload = multer({ storage });
const route = express.Router();

// send notification for user or host
route.post(
  '/toAll',
  checkAccess(),
  upload.single('image'),
  notificationCntroller.sendNotification
);

// send notification particular agency
route.post(
  '/agency/:agencyId',
  checkAccess(),
  upload.single('image'),
  notificationCntroller.particularAgencyNotification
);

// send notification particular agency
route.post(
  '/SendNotificationToAgencyHost',
  checkAccess(),
  upload.single('image'),
  notificationCntroller.SendNotificationToAgencyHost
);

// send notification particular user
route.post(
  '/:userId',
  checkAccess(),
  upload.single('image'),
  notificationCntroller.particularUserNotification
);
module.exports = route;
