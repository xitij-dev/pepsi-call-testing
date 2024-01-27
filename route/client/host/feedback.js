const express = require('express');

const route = express.Router();
const multer = require('multer');
const storage = require('../../../middleware/multer');

const upload = multer({
  storage,
});

// Dev and Security Key
const checkAccess = require('../../../middleware/checkAccess');

const FeedbackController = require('../../../controller/client/feedback');

route.post(
  '/',
  upload.single('screenshot'),
  checkAccess(),
  FeedbackController.storeHostFeedback
);

route.get('/', checkAccess(), FeedbackController.gethostfeedback);

route.delete('/:id', checkAccess(), FeedbackController.deleteFeedback);

module.exports = route;
