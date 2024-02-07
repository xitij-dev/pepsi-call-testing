/* eslint-disable import/no-unresolved */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { LOGIN_TYPE } = require('../constent/enum');

const userSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      default: null,
    },
    name: String,
    image: String,
    email: String,
    fcmToken: { type: String, default: null },
    referralCode: { type: String, default: null },
    loginType: { type: Number, enum: LOGIN_TYPE }, // 0.google  1.fb 2. quick
    identity: { type: String },
    age: { type: Number, default: null },
    lastLoginDate: String,
    isBlock: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },
    match: { type: Boolean, default: false },
    gender: { type: String, default: '' },
    country: { type: String },
    coin: { type: Number, default: 0 },

    recentConnectionId: { type: String, default: null },
    uniqueValue: { type: String, default: null }, //for call random uniqueValue

    purchageCoin: { type: Number, default: 0 },
    isReferral: { type: Boolean, default: false },
    storyView: { type: Number, default: 0 },
    packageName: { type: String, default: '' },
    referralCount: { type: Number, default: 0 },
    remainFreeCall: Number,
    globalState: { type: Number, enum: [0, 1], default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('User', userSchema);
