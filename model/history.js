const mongoose = require('mongoose');
const { HISTORY_TYPE } = require('../constent/enum');

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    otherUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
      default: null,
    },
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gift',
      default: null,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoinPlan',
      default: null,
    },
    type: { type: Number, enum: HISTORY_TYPE }, // 1: message ,2 : coinPlan , 3 : call , 4: loginBonus , 5: admin ,6: referralBonus ,7 : flashCoin , 8 :liveGift ,9: callGift , 10 : vipPlan , 11: flashVipPlan
    videoCallType: { type: String, default: 'female' }, // male , female, both
    uCoin: { type: Number, default: 0 }, // user coin
    hCoin: { type: Number, default: 0 }, // host coin
    callEndReason: { type: String, default: null },
    // hostRecevieCoin: { type: Number, default: 0 },
    // hostCoinEarned: { type: Number, default: 0 },
    isHostReceviedCoin: { type: Boolean, default: false },
    date: String,
    callUniqueId: { type: String, default: null },
    count: { type: Number, default: 0 }, // for call double entry
    orderId: { type: String, default: null },
    paymentGateway: { type: String, default: null },
    callConnect: { type: Boolean, default: false },
    isRandom: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    callStartTime: { type: String, default: null },
    callEndTime: { type: String, default: null },
    duration: { type: Number, default: 0 },
    caller: String,
  },
  {
    timestamps: true,
  }
);
historySchema.index({ userId: 1 });
historySchema.index({ hostId: 1 });
// eslint-disable-next-line new-cap
module.exports = new mongoose.model('History', historySchema);
