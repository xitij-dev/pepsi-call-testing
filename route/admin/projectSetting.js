const express = require('express');
const checkAccess = require('../../middleware/checkAccess');
const projectSettingController = require('../../controller/admin/projectSetting');

const route = express.Router();

// store setting
route.post('/', checkAccess(), projectSettingController.storSetting);

// get all setting for admin penal
route.get('/', checkAccess(), projectSettingController.getAllSetting);

// delete setting
route.delete('/:id', checkAccess(), projectSettingController.deleteSetting);

// update setting
route.patch('/:id', checkAccess(), projectSettingController.updateSetting);
module.exports = route;
