const express = require('express');
const reportController = require('../../../controller/client/report');
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();

// store report
route.post('/', checkAccess(), reportController.store);
module.exports = route;
