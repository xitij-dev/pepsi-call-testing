const express = require('express');
const userStryViewController = require('../../../controller/client/userStoryView');
const checkAccess = require('../../../middleware/checkAccess');

const route = express.Router();

// get 5 story for user
route.get('/', checkAccess(), userStryViewController.getUserStory);

// get view for user
route.get('/count', checkAccess(), userStryViewController.getUserStoryView);

module.exports = route;
