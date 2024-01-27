const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();
const liveUserController = require('../../../controller/client/liveUser');

route.get('/', checkAccess(), liveUserController.getLiveHost);
module.exports = route;
