const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();
const liveUserController = require('../../../controller/client/liveUser');

route.post('/', checkAccess(), liveUserController.hostIsLive);

module.exports = route;
