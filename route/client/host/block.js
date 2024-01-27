const express = require('express');

const route = express.Router();
const blockController = require('../../../controller/client/block');
const checkAccess = require('../../../middleware/checkAccess');

route.post('/', checkAccess(), blockController.blockUnblock);

route.get('/toHostList', checkAccess(), blockController.toHostList);
module.exports = route;
