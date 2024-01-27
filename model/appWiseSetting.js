const mongoose = require('mongoose');
const { LOGOTYPE } = require('../constent/enum');

const Facebook1 = {
  isFaceBook: { type: Boolean, default: true },
  faceBookId1: { type: String, default: '' },
  faceBookAPPSecreteId1: { type: String, default: '' },
  platformAPPId1: { type: String, default: '' },
  platformIns1: { type: String, default: '' },
  platformAPPOpen1: { type: String, default: '' },
  platformNative1: { type: String, default: '' },
  platformBanner1: { type: String, default: '' },
  platformRewarded1: { type: String, default: '' },
  platformOtherId1: { type: String, default: '' },
  faceBookId2: { type: String, default: '' },
  faceBookAPPSecreteId2: { type: String, default: '' },
  platformAPPId2: { type: String, default: '' },
  platformIns2: { type: String, default: '' },
  platformAPPOpen2: { type: String, default: '' },
  platformNative2: { type: String, default: '' },
  platformBanner2: { type: String, default: '' },
  platformRewarded2: { type: String, default: '' },
  platformOtherId2: { type: String, default: '' },
};

const Google1 = {
  isGoogle: { type: Boolean, default: true },
  googleId1: { type: String, default: '' },
  googleAPPSecreteId1: { type: String, default: '' },
  googleAPPId1: { type: String, default: '' },
  googleIns1: { type: String, default: '' },
  googleAPPOpen1: { type: String, default: '' },
  googleNative1: { type: String, default: '' },
  googleBanner1: { type: String, default: '' },
  googleRewarded1: { type: String, default: '' },
  googleOtherId1: { type: String, default: '' },
  googleId2: { type: String, default: '' },
  googleAPPSecreteId2: { type: String, default: '' },
  googleAPPId2: { type: String, default: '' },
  googleIns2: { type: String, default: '' },
  googleAPPOpen2: { type: String, default: '' },
  googleNative2: { type: String, default: '' },
  googleBanner2: { type: String, default: '' },
  googleRewarded2: { type: String, default: '' },
  googleOtherId2: { type: String, default: '' },
};

const appWiseSettingSchema = new mongoose.Schema(
  {
    // app setting
    isAppActive: { type: Boolean, default: true },
    appVersion: { type: Number, default: 1 },
    privacyPolicyLink: { type: String, default: '' },
    termAndCondition: { type: String, default: '' },
    appName: { type: String, default: '' },
    packageName: { type: String, default: '' },
    logo: { type: String, default: '' },
    logoType: { type: Number, enum: [LOGOTYPE], default: 0 },
    // stripeSwitch: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: 'STRIPE PUBLISHABLE KEY' },
    stripeSecretKey: { type: String, default: 'STRIPE SECRET KEY' },
    // razorpaySwitch: { type: Boolean, default: false },
    razorPaySecretKy: { type: String, default: 'RAZORPAY SECRET KEY' },
    razorPayPublishableKey: {
      type: String,
      default: 'RAZORPAY PUBLISHABLE KEY',
    },

    // upiPaySwitch: { type: Boolean, default: true },
    upiPayKey: { type: String, default: 'UPI PAY KEY' },
    referralBonus: { type: Number, default: 10 },

    // googleInAppSwitch: { type: Boolean, default: true },
    googleInAppKey: { type: String, default: 'GOOGLE IN APP KEY' },
    googleInAppEmail: { type: String, default: 'GOOGLE PLAY EMAIL' },

    paytm: { type: Boolean, default: false },
    phonePe: { type: Boolean, default: false },
    googlePay: { type: Boolean, default: false },
    bhim: { type: Boolean, default: false },

    googleLogin: { type: Boolean, default: false },
    facebookLogin: { type: Boolean, default: false },
    quickLogin: { type: Boolean, default: false },

    fakeCallDuration: { type: Number, default: 5 },
    fakeCallCount: { type: Number, default: 0 },
    isFakeCall: { type: Boolean, default: true },
    durationOfFreeCall: { type: Number, default: 30 },
    chargeForMatchMale: { type: Number, default: 10 },
    chargeForMatchFemale: { type: Number, default: 10 },

    minLiveView: { type: Number, default: 5 },
    maxLiveView: { type: Number, default: 15 },

    loginBonus: { type: Number, default: 30 },
    maxLoginBonus: { type: Number, default: 100 },
    freeStoryView: { type: Number, default: 5 },
    inidanPaymentGeteway: { type: Array, default: [] },
    otherPaymentGeteway: { type: Array, default: [] },
    
    // monetizationSetting
    appAdStatus: { type: Boolean, default: true },
    appHowShowAds: { type: Boolean, default: true },
    appDialogBeforeAddShow: { type: Boolean, default: true },
    facebook: Facebook1,
    google: Google1,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('appWiseSetting', appWiseSettingSchema);
