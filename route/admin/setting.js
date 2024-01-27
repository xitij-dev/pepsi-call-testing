const express = require('express');
const checkAccessWithSecretKey = require('../../middleware/checkAccess');

const route = express.Router();
const settingController = require('../../controller/admin/setting');

route.post('/', checkAccessWithSecretKey(), settingController.store);

// update setting
route.patch(
  '/:settingId',
  checkAccessWithSecretKey(),
  settingController.update
);

// switch for app active deactive
// route.put(
//   '/app',
//   checkAccessWithSecretKey(),
//   settingController.swichForAppActive
// );

// switch for login
// route.put('/', checkAccessWithSecretKey(), settingController.handleSwitch);

route.get('/', checkAccessWithSecretKey(), settingController.getSetting);

// get app wise settting
route.get(
  '/getAppWiseSetting',
  checkAccessWithSecretKey(),
  settingController.getAppWiseSetting
);
module.exports = route;
