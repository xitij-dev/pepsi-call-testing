const mongoose = require('mongoose');
const {
  HOST_TYPE,
  VIDEOTYPE,
  IMAGETYPE,
  PROFILEPIC_TYPE,
} = require('../constent/enum');

const hostSchema = new mongoose.Schema(
  {
    name: String,
    uniqueId: { type: Number, default: null },
    password: String,
    bio: { type: String, default: '' },
    channel: { type: String, default: null },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
    profilePic: { type: String, default: null },
    image: { type: Array, default: [] },
    coin: { type: Number, default: 0 },
    lastLogin: String,
    appVersion: { type: Number, default: 0 },
    isBlock: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastSettlementCoin: { type: Number, default: 0 },
    type: { type: Number, enum: HOST_TYPE, require: true }, // host type for fake or real
    isLive: { type: Boolean, default: false },
    forRandomCall: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isRejected: { type: Boolean, default: false },
    callCharge: { type: Number, default: 0 },
    isBusy: { type: Boolean, default: false },
    receiveCoin: { type: Number, default: 0 },
    receiveGift: { type: Number, default: 0 },
    identity: { type: String, default: null },
    recentConnectionId: { type: String, default: null },
    fcm_token: { type: String, default: null },
    gender: { type: String, default: null },
    age: { type: Number, default: 18 },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    globalState: { type: Number, enum: [0, 1], default: 0 },
    video: { type: String, default: '' },
    videoType: { type: Number, enum: VIDEOTYPE, default: null },
    profilePicType: { type: Number, enum: PROFILEPIC_TYPE, default: null },
    imageType: { type: Number, enum: IMAGETYPE, default: null },
    interestedTopics: { type: Array, default: [] },
    iWantYour: { type: Array, default: [] },
    describeMySelf: { type: Array, default: [] },
    moreInformation: { type: Array, default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('Host', hostSchema);
