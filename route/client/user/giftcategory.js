const express = require('express');

const route = express.Router();

const CategoryController = require('../../../controller/admin/giftCategory');
const checkAccess = require('../../../middleware/checkAccess');

// get category
route.get('/', checkAccess(), CategoryController.allCategory);

module.exports = route;
