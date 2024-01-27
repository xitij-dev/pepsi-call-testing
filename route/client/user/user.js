// Express
const express = require('express');
const multer = require('multer');
const storage = require('../../../middleware/multer');

const upload = multer({ storage });
const route = express.Router();

// Dev and Security Key
const checkAccessWithSecretKey = require('../../../middleware/checkAccess');
const userController = require('../../../controller/client/user');

route.post('/signup', checkAccessWithSecretKey(), userController.store);

route.patch(
  '/update/:userId',
  checkAccessWithSecretKey(),
  upload.single('image'),
  userController.updateUser
);

route.get('/profile', checkAccessWithSecretKey(), userController.getProfile);

route.delete('/delete', checkAccessWithSecretKey(), userController.deleteUser);

// plan purchase
route.post(
  '/purchasePlan',
  checkAccessWithSecretKey(),
  userController.purchagePlan
);

// add coin using reffrle code
route.post(
  '/reffrleBonus',
  checkAccessWithSecretKey(),
  userController.userReffrleBonus
);

// update fcm token for user or host
route.post('/updateFCM', checkAccessWithSecretKey(), userController.updateFCm);

route.get(
  '/checkOnline',
  checkAccessWithSecretKey(),
  userController.checkUserIsOnline
);
module.exports = route;
