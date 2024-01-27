const express = require('express');

const route = express.Router();
const hostRoute = require('./host');
const blockRoute = require('./block');
const feedbackRout = require('./feedback');
const storyRoute = require('./story');
const notificationRoute = require('./notification');
const historyRoute = require('./history');
const liveUserRoute = require('./liveUser');
const liveStreamingRoute = require('./liveStreaming');


route.use('/', hostRoute);
route.use('/block', blockRoute);
route.use('/feedback', feedbackRout);
route.use('/story', storyRoute);
route.use('/liveUser', liveUserRoute);
route.use('/notification', notificationRoute);
route.use('/history', historyRoute);
route.use(
  '/getStreamingSummary',liveStreamingRoute
);
module.exports = route;
