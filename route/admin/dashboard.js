// eslint-disable-next-line import/newline-after-import
const express = require('express');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();
const dashboardController = require('../../controller/admin/dashboard');

// total user for admin penal
route.get(
  '/totalUserForAdminPenal',
  checkAccess(),
  dashboardController.totalUserForAdminPenal
);

// total host for admin penal
route.get(
  '/totalHostForAdminPenal',
  checkAccess(),
  dashboardController.totalHostForAdminPenal
);

// analytic in chart for admin penal
route.get(
  '/chartAnalyticForPenal',
  checkAccess(),
  dashboardController.chartAnalyticForPenal
);

// hostOrSettlementChartForAgencyPenal for agency penal
route.get(
  '/chartForAgencyPenal',
  checkAccess(),
  dashboardController.hostOrSettlementChartForAgencyPenal
);

// get agecny revenue for agency penal
route.get(
  '/getRevenueAgencyPenal',
  checkAccess(),
  dashboardController.getAgencyRevenueForAgencyPenal
);

module.exports = route;
