// express
const express = require('express');

const route = express.Router();

const reportController = require('../../controller/client/report');
const checkAccess = require('../../middleware/checkAccess');

// get user report in penal
route.get('/hostReport', checkAccess(), reportController.getReportByUser);

// get host report in penal
route.get('/userReport', checkAccess(), reportController.getReportByHost);

module.exports = route;
