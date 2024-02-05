const express = require('express');

const route = express.Router();
const multer = require('multer');
const hostController = require('../../../controller/client/host');
const checkAccessWithSecretKey = require('../../../middleware/checkAccess');
const storage = require('../../../middleware/multer');

const upload = multer({ storage });

route.post('/login', checkAccessWithSecretKey(), hostController.login);

route.get('/profile', checkAccessWithSecretKey(), hostController.getProfile);

route.put(
  '/hostIsOnline',
  checkAccessWithSecretKey(),
  hostController.hostIsOnline
);

//  api for random call or not
route.put(
  '/switchForRandomCall',
  checkAccessWithSecretKey(),
  hostController.switchForRandomCall
);

route.post(
  '/updateImages',
  upload.single('image'),
  checkAccessWithSecretKey(),
  hostController.updateImages
);

// delete images
route.delete(
  '/deleteImages',
  checkAccessWithSecretKey(),
  hostController.deleteImages
);
route.patch(
  '/update',
  checkAccessWithSecretKey(),
  upload.single('profilePic'),
  hostController.updateProfile
);

// Host video approved API
route.get(
  '/checkOnline',
  checkAccessWithSecretKey(),
  hostController.checkHostIsOnline
);
// Host video approved API

// get hostProfile for socket in app
route.get(
  '/getHostProfileForApp',
  checkAccessWithSecretKey(),
  hostController.getHostProfileForApp
);

// get fake random host for android
route.get(
  '/randomFakeHost',
  checkAccessWithSecretKey(),
  hostController.getRamdomFakeHost
);

// get random live host
route.get(
  '/getRandomLiveHost',
  checkAccessWithSecretKey(),
  hostController.getRandomLiveHost
);

// get random live host
route.get(
  '/getParticularLiveHost',
  checkAccessWithSecretKey(),
  hostController.getParticularLiveHost
);
module.exports = route;
