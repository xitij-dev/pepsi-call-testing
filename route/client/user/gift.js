const express = require('express');
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();
const GiftController = require('../../../controller/admin/gift');

// get category wise gift
route.get('/categoryWiseGift', checkAccess(), GiftController.categoryWiseGift);
module.exports = route;
