const express = require('express');

const route = express.Router();
const multer = require('multer');
const hostController = require('../../controller/client/host');
const checkAccessWithSecretKey = require('../../middleware/checkAccess');
const storage = require('../../middleware/multer');

const upload = multer({ storage });

route.post(
  '/signup',
  checkAccessWithSecretKey(),
  upload.fields([{ name: 'profilePic' }, { name: 'image' }]),
  hostController.singup
);

route.put(
  '/blockUnblock',
  checkAccessWithSecretKey(),
  hostController.blockUnblock
);

route.get('/', checkAccessWithSecretKey(), hostController.index);

// approve or reject host
route.put('/approve', checkAccessWithSecretKey(), hostController.approvedHost);

// add or cut host coin
route.post(
  '/addLessCoinHost',
  checkAccessWithSecretKey(),
  hostController.addLessCoinHost
);

// insert fake host
route.post(
  '/insertFakeHost',
  checkAccessWithSecretKey(),
  upload.fields([{ name: 'video' }, { name: 'profilePic' }, { name: 'image' }]),
  hostController.createFakeHost
);

// insert multiple host using excel
route.post(
  '/insertFakeHostByExcel',
  checkAccessWithSecretKey(),
  upload.single('file'),
  hostController.insertFakeHostByExcel
);

// update fake host
route.patch(
  '/updateFakeHost/:hostId',
  checkAccessWithSecretKey(),
  upload.fields([{ name: 'video' }, { name: 'profilePic' }, { name: 'image' }]),
  hostController.updateFakeHost
);

// get host by agency wise
route.get(
  '/getHostAgencyWise',
  checkAccessWithSecretKey(),
  hostController.getHostAgencyWise
);

// update host profile by admin
route.patch(
  '/updateProfileByAdmin',
  checkAccessWithSecretKey(),
  upload.fields([{ name: 'profilePic' }, { name: 'image' }]),
  hostController.updateProfileByAdmin
);

// deleted host image by admin
route.delete(
  '/deleteImagesByAdmin',
  checkAccessWithSecretKey(),
  hostController.deleteImagesByAdmin
);

// delete host topic
route.delete(
  '/deleteTopic',
  checkAccessWithSecretKey(),
  hostController.deleteHostTopic
);

// update host topic
route.patch(
  '/updateTopic/:hostId',
  checkAccessWithSecretKey(),
  hostController.updateHostTopic
);

// get fake host list for fake host
route.get(
  '/getFakeHostForStory',
  checkAccessWithSecretKey(),
  hostController.getFakeHostForStory
);

module.exports = route;
