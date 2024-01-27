const express = require('express');

const route = express.Router();

// Dev and Security Key
const checkAccessWithSecretKey = require('../../middleware/checkAccess');

const DataController = require('../../controller/client/data');

route.post('/', checkAccessWithSecretKey(), DataController.store);
route.get('/', checkAccessWithSecretKey(), DataController.get);

module.exports = route;
