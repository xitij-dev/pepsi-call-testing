const express = require('express');
const multer = require('multer');
const storage = require('../../middleware/multer');

const upload = multer({ storage });
const appWiseSettingController = require('../../controller/admin/appWiseSetting');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();

// add setting
route.post(
  '/add',
  checkAccess(),
  upload.single('logo'),
  appWiseSettingController.addSetting
);

// update handleswitch
route.put(
  '/switch',
  checkAccess(),
  appWiseSettingController.updateHandleSwitch
);

// update setting
route.patch(
  '/update',
  checkAccess(),
  upload.single('logo'),
  appWiseSettingController.updateSetting
);

// get setting
route.get('/', checkAccess(), appWiseSettingController.getSetting);

// delete setting
route.delete('/', checkAccess(), appWiseSettingController.deleteSetting);

// switch for login
route.put('/', checkAccess(), appWiseSettingController.handleSwitch);

// get setting using id
route.get('/byId', checkAccess(), appWiseSettingController.getSettingById);

module.exports = route;
