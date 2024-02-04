const express = require('express');

const route = express.Router();

// Dev and Security Key
const checkAccessWithSecretKey = require('../../../middleware/checkAccess');

// User Controller
const RandomController = require('../../../controller/client/random');

route.get('/', checkAccessWithSecretKey(), RandomController.match);
<<<<<<< HEAD
=======
// route.get('/queStop', checkAccessWithSecretKey(), RandomController.queStop);


// route.get('/removeQue', checkAccessWithSecretKey(), RandomController.removeQue);
>>>>>>> d1e06f04616e32d61d05dc914cd97d9814c2be40

module.exports = route;
