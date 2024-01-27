const express = require('express');

const route = express.Router();
const countryController = require('../../../controller/admin/country');
const checkAccess = require('../../../middleware/checkAccess');

route.get('/', checkAccess(), countryController.getCountryHostWise);

module.exports = route;
