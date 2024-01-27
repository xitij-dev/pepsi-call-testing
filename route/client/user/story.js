const express = require('express');

const route = express.Router();
const storyController = require('../../../controller/client/story');
const checkAccess = require('../../../middleware/checkAccess');

route.get('/', checkAccess(), storyController.getAllHostStory);

module.exports = route;
