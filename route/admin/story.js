const express = require('express');
const multer = require('multer');
const storyController = require('../../controller/client/story');
const storage = require('../../middleware/multer');
const checkAccess = require('../../middleware/checkAccess');

const upload = multer({ storage });
const route = express.Router();

// add fake story
route.post(
  '/addFake',
  checkAccess(),
  upload.fields([{ name: 'story' }, { name: 'preview' }]),
  storyController.addFakeStory
);

// get fake story
route.get('/getFakeStory', checkAccess(), storyController.getFakeStory);
module.exports = route;
