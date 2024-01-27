const express = require('express');

const route = express.Router();
const storyViewController = require('../../../controller/client/storyView');
const checkAccess = require('../../../middleware/checkAccess');

route.post('/', checkAccess(), storyViewController.storeView);

route.get('/', checkAccess(), storyViewController.getView);

module.exports = route;
