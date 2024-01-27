const express = require('express');
const multer = require('multer');
const storage = require('../../../middleware/multer');

const upload = multer({
  storage,
});
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();
const coinPlanController = require('../../../controller/admin/coinPlan');

route.get('/', checkAccess(), coinPlanController.getCoinPlanForAndroid);

// purchase using gooleplay
route.post('/purchase/googlePlay', coinPlanController.payGooglePlay);

// web hook payment
route.post(
  '/payment/paymentupdate',
  upload.single('image'),
  coinPlanController.webHookPayment
);
module.exports = route;
