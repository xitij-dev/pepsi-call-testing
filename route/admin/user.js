const express = require('express');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();
const userController = require('../../controller/client/user');

route.post('/addLessCoin', checkAccess(), userController.addLessCoin);

// get all user for admin penal
route.get('/', checkAccess(), userController.index);

// block unblock user
route.put('/:userId', checkAccess(), userController.blockUnblockByAdmin);
module.exports = route;
