const express = require('express');

const route = express.Router();
const feedbackController = require('../../controller/client/feedback');
const checkAccess = require('../../middleware/checkAccess');

route.put('/:id', checkAccess(), feedbackController.updateFeedback);

// eslint-disable-next-line spaced-comment
//get all feedback for user in admin panel
route.get(
  '/getAllFeedbackForUser',
  checkAccess(),
  feedbackController.getAllFeedbackForUser
);

// get all host feedback for admin panel
route.get(
  '/getAllHostFeedback',
  checkAccess(),
  feedbackController.getAllHostFeedback
);

// delete feed backe for admin panel
route.delete('/:id', checkAccess(), feedbackController.deleteFeedback);

module.exports = route;
