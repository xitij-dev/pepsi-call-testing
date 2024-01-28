const express = require('express');
const adminRoute = require('./admin');
const clientRoute = require('./client');

const multer = require('multer');

const storage = require('../middleware/multer');

const upload = multer({
  storage,
});
const coinPlanController = require('../controller/admin/coinPlan');

const route = express.Router();

route.use('/admin', adminRoute);
route.use('/client', clientRoute);

// web hook payment
route.post(
  '/paymentupdate',
  upload.single('image'),
  coinPlanController.webHookPayment
);
module.exports = route;
