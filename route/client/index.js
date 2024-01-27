const express = require('express');
const userRoute = require('./user');
const hostRoute = require('./host');

const route = express.Router();

route.use('/user', userRoute);
route.use('/host', hostRoute);

module.exports = route;
