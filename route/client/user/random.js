const express = require('express');

const route = express.Router();

// Dev and Security Key
const checkAccessWithSecretKey = require('../../../middleware/checkAccess');

// User Controller
const RandomController = require('../../../controller/client/random');

route.get('/', checkAccessWithSecretKey(), RandomController.match);
route.get('/queStop', checkAccessWithSecretKey(), RandomController.queStop);


module.exports = route;
