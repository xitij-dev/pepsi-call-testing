// Express
const express = require('express');
const multer = require('multer');
const storage = require('../../../middleware/multer');

const upload = multer({
  storage,
});

const route = express.Router();

// Dev and Security Key
const checkAccess = require('../../../middleware/checkAccess');

const FeedbackController = require('../../../controller/client/feedback');

route.get('/list', checkAccess(), FeedbackController.get);

route.post(
  '/',
  upload.single('screenshot'),
  checkAccess(),
  FeedbackController.store
);

route.delete('/:id', checkAccess(), FeedbackController.deleteFeedback);

module.exports = route;
