const express = require('express');
const multer = require('multer');
const storage = require('../../../middleware/multer');

const upload = multer({ storage });
const route = express.Router();

const storyController = require('../../../controller/client/story');
const checkAccess = require('../../../middleware/checkAccess');

route.post(
  '/',
  checkAccess(),
  upload.fields([{ name: 'story' }, { name: 'preview' }]),
  storyController.createStory
);

route.get('/:hostId', checkAccess(), storyController.getStoryByHostId);
route.delete('/:id', checkAccess(), storyController.deleteStory);
module.exports = route;
