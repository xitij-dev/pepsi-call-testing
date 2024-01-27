const express = require('express');

const route = express.Router();
const hostController = require('../../../controller/client/host');
const checkAccess = require('../../../middleware/checkAccess');

route.get('/getRandomHost', checkAccess(), hostController.getRandomHost);
module.exports = route;
