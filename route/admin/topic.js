const express = require('express');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();
const topicController = require('../../controller/admin/topic');

// add topic
route.post('/', checkAccess(), topicController.store);

// get all topic
route.get('/', checkAccess(), topicController.getAll);

// update topic
route.patch('/:id', checkAccess(), topicController.addTopic);

// delete topic
route.delete('/:id', checkAccess(), topicController.delete);

module.exports = route;
