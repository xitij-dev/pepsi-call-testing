const express = require('express');

const route = express.Router();
const adminRoute = require('./admin');
const coinPlanRoute = require('./coinPlan');
const settingRoute = require('./setting');
const agencyRoute = require('./agency');
const feedbackRout = require('./feedback');
const projectSettingRoute = require('./projectSetting');
const countryRoute = require('./country');
const DataRoute = require('./data');
const giftRoute = require('./gift');
const agencySettlementHistoryRoute = require('./agencySettlementHistory');
const vipPlanRoute = require('./vipPlan');
const notificationRoute = require('./notification');
const appWiseSettingRoute = require('./appWiseSetting');
const userRoute = require('./user');
const dashboardRoute = require('./dashboard');
const vipBannerRoute = require('./vipBanner');
const liveStramingHistoryRoute = require('./liveStreamingHistory');
const historyRoute = require('./history');
const hostSettlementRoute = require('./hostSettlementHistory');
const topicRoute = require('./topic');
const storyRoute = require('./story');
const hostRoute = require('./host');
const giftCategoryRoute = require('./giftCategory');
const reportRoute = require('./report');
const flashCoinRoute = require('./flashCoin');
const vipFlashCoinRoute = require('./vipFlashCoin');


route.use('/', adminRoute);
route.use('/agency', agencyRoute);
route.use('/coinPlan', coinPlanRoute);
route.use('/setting', settingRoute);
route.use('/feedback', feedbackRout);
route.use('/gift', giftRoute);
route.use('/data', DataRoute);
route.use('/country', countryRoute);
route.use('/dashboard', dashboardRoute);
route.use('/notification', notificationRoute);
route.use('/liveStreamingHistory', liveStramingHistoryRoute);
route.use('/history', historyRoute);
route.use('/agencySettlement', agencySettlementHistoryRoute);
route.use('/vipPlan', vipPlanRoute);
route.use('/projectSetting', projectSettingRoute);
route.use('/topic', topicRoute);
route.use('/story', storyRoute);
route.use('/hostSettlement', hostSettlementRoute);
route.use('/appWiseSetting', appWiseSettingRoute);
route.use('/vipBanner', vipBannerRoute);
route.use('/giftCategory', giftCategoryRoute);
route.use('/user', userRoute);
route.use('/report', reportRoute);
route.use('/host', hostRoute);
route.use('/flashCoin', flashCoinRoute);
route.use('/vipFlashCoin', vipFlashCoinRoute);


module.exports = route;
