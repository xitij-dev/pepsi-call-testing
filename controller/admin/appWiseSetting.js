const fs = require('fs');
const AppWiseSetting = require('../../model/appWiseSetting');

// add app wise setting
exports.addSetting = async (req, res) => {
  try {
    if (!req?.body) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const appwisesetting = new AppWiseSetting();
    appwisesetting.appVersion = req?.body?.appVersion;
    appwisesetting.privacyPolicyLink = req?.body?.privacyPolicyLink;
    appwisesetting.termAndCondition = req?.body?.termAndCondition;
    appwisesetting.appName = req?.body?.appName;
    appwisesetting.packageName = req?.body?.packageName;

    appwisesetting.durationOfFreeCall = req.body.durationOfFreeCall;

    appwisesetting.chargeForMatchMale = req.body.chargeForMatchMale;

    appwisesetting.chargeForMatchFemale = req.body.chargeForMatchFemale;

    appwisesetting.freeStoryView = req.body.freeStoryView;

    appwisesetting.loginBonus = req.body.loginBonus;

    appwisesetting.referralBonus = req.body.referralBonus;

    appwisesetting.maxLoginBonus = req.body.maxLoginBonus;

    appwisesetting.stripePublishableKey = req.body.stripePublishableKey;

    appwisesetting.stripeSecretKey = req.body.stripeSecretKey;

    appwisesetting.razorPaySecretKy = req.body.razorPaySecretKy;

    appwisesetting.razorPayPublishableKey = req.body.razorPayPublishableKey;

    appwisesetting.minLiveView = req.body.minLiveView;

    appwisesetting.maxLiveView = req.body.maxLiveView;

    appwisesetting.fakeCallDuration = req.body.fakeCallDuration;

    appwisesetting.upiPayKey = req.body.upiPayKey;

    appwisesetting.googleInAppKey = req.body.googleInAppKey;

    appwisesetting.googleInAppEmail = req.body.googleInAppEmail;

    appwisesetting.appVersion = req.body.appVersion;

    appwisesetting.fakeCallCount = req.body.fakeCallCount;

    // monetizationSetting
    const Facebook1 = {
      faceBookId1: req?.body?.faceBookId1,
      faceBookAPPSecreteId1: req?.body?.faceBookAPPSecreteId1,
      platformAPPId1: req?.body?.platformAPPId1,
      platformIns1: req?.body?.platformIns1,
      platformAPPOpen1: req?.body?.platformAPPOpen1,
      platformNative1: req?.body?.platformNative1,
      platformBanner1: req?.body?.platformBanner1,
      platformRewarded1: req?.body?.platformRewarded1,
      platformOtherId1: req?.body?.platformOtherId1,
      faceBookId2: req?.body?.faceBookId2,
      faceBookAPPSecreteId2: req?.body?.faceBookAPPSecreteId2,
      platformAPPId2: req?.body?.platformAPPId2,
      platformIns2: req?.body?.platformIns2,
      platformAPPOpen2: req?.body?.platformAPPOpen2,
      platformNative2: req?.body?.platformNative2,
      platformBanner2: req?.body?.platformBanner2,
      platformRewarded2: req?.body?.platformRewarded2,
      platformOtherId2: req?.body?.platformOtherId2,
    };

    const Google1 = {
      googleId1: req?.body?.googleId1,
      googleAPPSecreteId1: req?.body?.googleAPPSecreteId1,
      googleAPPId1: req?.body?.googleAPPId1,
      googleIns1: req?.body?.googleIns1,
      googleAPPOpen1: req?.body?.googleAPPOpen1,
      googleNative1: req?.body?.googleNative1,
      googleBanner1: req?.body?.googleBanner1,
      googleRewarded1: req?.body?.googleRewarded1,
      googleOtherId1: req?.body?.googleOtherId1,
      googleId2: req?.body?.googleId2,
      googleAPPSecreteId2: req?.body?.googleAPPSecreteId2,
      googleAPPId2: req?.body?.googleAPPId2,
      googleIns2: req?.body?.googleIns2,
      googleAPPOpen2: req?.body?.googleAPPOpen2,
      googleNative2: req?.body?.googleNative2,
      googleBanner2: req?.body?.googleBanner2,
      googleRewarded2: req?.body?.googleRewarded2,
      googleOtherId2: req?.body?.googleOtherId2,
    };

    appwisesetting.facebook = Facebook1;
    appwisesetting.google = Google1;

    if (req?.body.logoType && req?.body?.logoType == 0) {
      if (req?.file) {
        appwisesetting.logo = req?.file?.path;
      }
      appwisesetting.logoType = req?.body.logoType;
    }

    if (req?.body.logoType && req?.body?.logoType == 1) {
      if (req?.body?.logo) {
        appwisesetting.logo = req?.body?.logo;
      }
      appwisesetting.logoType = req?.body.logoType;
    }

    await appwisesetting.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', appwisesetting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// update setting in handle switch
exports.updateHandleSwitch = async (req, res) => {
  try {
    if (!req?.query?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await AppWiseSetting.findOne({
      _id: req?.query?.id,
    });

    if (!setting) {
      return res
        .status(200)
        .send({ status: false, message: 'setting not found' });
    }

    if (req?.query?.type === 'appActive') {
      setting.isAppActive = !setting.isAppActive;
    }

    await setting.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// update setting api
exports.updateSetting = async (req, res) => {
  try {
    if (!req?.query?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await AppWiseSetting.findOne({
      _id: req?.query?.id,
    });

    if (!setting) {
      return res
        .status(200)
        .send({ status: false, message: 'setting not found' });
    }
    setting.appVersion = req?.body?.appVersion
      ? req?.body?.appVersion
      : setting.appVersion;
    setting.privacyPolicyLink = req?.body?.privacyPolicyLink
      ? req?.body?.privacyPolicyLink
      : setting.privacyPolicyLink;
    setting.termAndCondition = req?.body?.termAndCondition
      ? req?.body?.termAndCondition
      : setting.termAndCondition;
    setting.appName = req?.body?.appName ? req?.body?.appName : setting.appName;
    setting.packageName = req?.body?.packageName
      ? req?.body?.packageName
      : setting.packageName;
    setting.logo = req?.body?.logo ? req?.body?.logo : setting.logo;

    setting.durationOfFreeCall = req.body.durationOfFreeCall
      ? req.body.durationOfFreeCall
      : setting.durationOfFreeCall;
    setting.chargeForMatchMale = req.body.chargeForMatchMale
      ? req.body.chargeForMatchMale
      : setting.chargeForMatchMale;
    setting.chargeForMatchFemale = req.body.chargeForMatchFemale
      ? req.body.chargeForMatchFemale
      : setting.chargeForMatchFemale;
    setting.freeStoryView = req.body.freeStoryView
      ? req.body.freeStoryView
      : setting.freeStoryView;
    setting.loginBonus = req.body.loginBonus
      ? req.body.loginBonus
      : setting.loginBonus;

    setting.referralBonus = req.body.referralBonus
      ? req.body.referralBonus
      : setting.referralBonus;
    setting.maxLoginBonus = req.body.maxLoginBonus
      ? req.body.maxLoginBonus
      : setting.maxLoginBonus;
    setting.stripePublishableKey = req.body.stripePublishableKey
      ? req.body.stripePublishableKey
      : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey
      ? req.body.stripeSecretKey
      : setting.stripeSecretKey;
    setting.razorPaySecretKy = req.body.razorPaySecretKy
      ? req.body.razorPaySecretKy
      : setting.razorPaySecretKy;
    setting.razorPayPublishableKey = req.body.razorPayPublishableKey
      ? req.body.razorPayPublishableKey
      : setting.razorPayPublishableKey;
    setting.minLiveView = req.body.minLiveView
      ? req.body.minLiveView
      : setting.minLiveView;
    setting.maxLiveView = req.body.maxLiveView
      ? req.body.maxLiveView
      : setting.maxLiveView;
    setting.fakeCallDuration = req.body.fakeCallDuration
      ? req.body.fakeCallDuration
      : setting.fakeCallDuration;
    setting.upiPayKey = req.body.upiPayKey
      ? req.body.upiPayKey
      : setting.upiPayKey;
    setting.googleInAppKey = req.body.googleInAppKey
      ? req.body.googleInAppKey
      : setting.googleInAppKey;
    setting.googleInAppEmail = req.body.googleInAppEmail
      ? req.body.googleInAppEmail
      : setting.googleInAppEmail;
    setting.appVersion = req.body.appVersion
      ? req.body.appVersion
      : setting.appVersion;
    setting.fakeCallCount = req.body.fakeCallCount
      ? req.body.fakeCallCount
      : setting.fakeCallCount;
    // setting.inidanPaymentGeteway = req.body.inidanPaymentGeteway
    //   ? req.body.inidanPaymentGeteway
    //   : setting.inidanPaymentGeteway;
    // setting.otherPaymentGeteway = req.body.otherPaymentGeteway
    //   ? req.body.otherPaymentGeteway
    //   : setting.otherPaymentGeteway;
    if (req?.body?.inidanPaymentGeteway) {
      const oetherArr = Array.isArray(req?.body?.inidanPaymentGeteway)
        ? req?.body?.inidanPaymentGeteway
        : [req?.body?.inidanPaymentGeteway];
      setting.inidanPaymentGeteway = [];
      for (const arr of oetherArr) {
        const elements = arr.split(',');
        for (const element of elements) {
          setting.inidanPaymentGeteway.push(element);
        }
      }
    }
    if (req?.body?.otherPaymentGeteway) {
      const oetherArr = Array.isArray(req?.body?.otherPaymentGeteway)
        ? req?.body?.otherPaymentGeteway
        : [req?.body?.otherPaymentGeteway];
      setting.otherPaymentGeteway = [];
      for (const Arr of oetherArr) {
        const elements = Arr.split(',');
        for (const element of elements) {
          setting.otherPaymentGeteway.push(element);
        }
      }
    }

    // monetizationSetting
    const Facebook1 = {
      faceBookId1: req?.body?.faceBookId1
        ? req?.body?.faceBookId1
        : setting?.facebook?.faceBookId1,
      faceBookAPPSecreteId1: req?.body?.faceBookAPPSecreteId1
        ? req?.body?.faceBookAPPSecreteId1
        : setting?.facebook?.faceBookAPPSecreteId1,
      platformAPPId1: req?.body?.platformAPPId1
        ? req?.body?.platformAPPId1
        : setting?.facebook?.platformAPPId1,
      platformIns1: req?.body?.platformIns1
        ? req?.body?.platformIns1
        : setting?.facebook?.platformIns1,
      platformAPPOpen1: req?.body?.platformAPPOpen1
        ? req?.body?.platformAPPOpen1
        : setting?.facebook?.platformAPPOpen1,
      platformNative1: req?.body?.platformNative1
        ? req?.body?.platformNative1
        : setting?.facebook?.platformNative1,
      platformBanner1: req?.body?.platformBanner1
        ? req?.body?.platformBanner1
        : setting?.facebook?.platformBanner1,
      platformRewarded1: req?.body?.platformRewarded1
        ? req?.body?.platformRewarded1
        : setting?.facebook?.platformRewarded1,
      platformOtherId1: req?.body?.platformOtherId1
        ? req?.body?.platformOtherId1
        : setting?.facebook?.platformOtherId1,
      faceBookId2: req?.body?.faceBookId2,
      faceBookAPPSecreteId2: req?.body?.faceBookAPPSecreteId2
        ? req?.body?.faceBookAPPSecreteId2
        : setting?.facebook?.faceBookAPPSecreteId2,
      platformAPPId2: req?.body?.platformAPPId2
        ? req?.body?.platformAPPId2
        : setting?.facebook?.platformAPPId2,
      platformIns2: req?.body?.platformIns2
        ? req?.body?.platformIns2
        : setting?.facebook?.platformIns2,
      platformAPPOpen2: req?.body?.platformAPPOpen2
        ? req?.body?.platformAPPOpen2
        : setting?.facebook?.platformAPPOpen2,
      platformNative2: req?.body?.platformNative2
        ? req?.body?.platformNative2
        : setting?.facebook?.platformNative2,
      platformBanner2: req?.body?.platformBanner2
        ? req?.body?.platformBanner2
        : setting?.facebook?.platformBanner2,
      platformRewarded2: req?.body?.platformRewarded2
        ? req?.body?.platformRewarded2
        : setting?.facebook?.platformRewarded2,
      platformOtherId2: req?.body?.platformOtherId2
        ? req?.body?.platformOtherId2
        : setting?.facebook?.platformOtherId2,
    };

    const Google1 = {
      googleId1: req?.body?.googleId1
        ? req?.body?.googleId1
        : setting?.google?.googleId1,
      googleAPPSecreteId1: req?.body?.googleAPPSecreteId1
        ? req?.body?.googleAPPSecreteId1
        : setting?.google?.googleAPPSecreteId1,
      googleAPPId1: req?.body?.googleAPPId1
        ? req?.body?.googleAPPId1
        : setting?.google?.googleAPPId1,
      googleIns1: req?.body?.googleIns1
        ? req?.body?.googleIns1
        : setting?.google?.googleIns1,
      googleAPPOpen1: req?.body?.googleAPPOpen1
        ? req?.body?.googleAPPOpen1
        : setting?.google?.googleAPPOpen1,
      googleNative1: req?.body?.googleNative1
        ? req?.body?.googleNative1
        : setting?.google?.googleNative1,
      googleBanner1: req?.body?.googleBanner1
        ? req?.body?.googleBanner1
        : setting?.google?.googleBanner1,
      googleRewarded1: req?.body?.googleRewarded1
        ? req?.body?.googleRewarded1
        : setting?.google?.googleRewarded1,
      googleOtherId1: req?.body?.googleOtherId1
        ? req?.body?.googleOtherId1
        : setting?.google?.googleOtherId1,
      googleId2: req?.body?.googleId2
        ? req?.body?.googleId2
        : setting?.google?.googleId2,
      googleAPPSecreteId2: req?.body?.googleAPPSecreteId2
        ? req?.body?.googleAPPSecreteId2
        : setting?.google?.googleAPPSecreteId2,
      googleAPPId2: req?.body?.googleAPPId2
        ? req?.body?.googleAPPId2
        : setting?.google?.googleAPPId2,
      googleIns2: req?.body?.googleIns2
        ? req?.body?.googleIns2
        : setting?.google?.googleIns2,
      googleAPPOpen2: req?.body?.googleAPPOpen2
        ? req?.body?.googleAPPOpen2
        : setting?.google?.googleAPPOpen2,
      googleNative2: req?.body?.googleNative2
        ? req?.body?.googleNative2
        : setting?.google?.googleNative2,
      googleBanner2: req?.body?.googleBanner2
        ? req?.body?.googleBanner2
        : setting?.google?.googleBanner2,
      googleRewarded2: req?.body?.googleRewarded2
        ? req?.body?.googleRewarded2
        : setting?.google?.googleRewarded2,
      googleOtherId2: req?.body?.googleOtherId2
        ? req?.body?.googleOtherId2
        : setting?.google?.googleOtherId2,
    };

    setting.facebook = Facebook1;
    setting.google = Google1;

    if (req?.body.logoType && req?.body?.logoType == 0) {
      if (req?.file) {
        const image = setting.logo;
        if (fs.existsSync(image)) {
          fs.unlinkSync(image);
        }
        setting.logo = req?.file?.path;
      }
      setting.logoType = req?.body.logoType;
    }

    if (req?.body.logoType && req?.body?.logoType == 1) {
      if (req?.body?.logo) {
        const image = setting.logo;
        if (fs.existsSync(image)) {
          fs.unlinkSync(image);
        }
        setting.logo = req?.body?.logo;
      }
      setting.logoType = req?.body.logoType;
    }

    await setting.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// delete setting
exports.deleteSetting = async (req, res) => {
  try {
    if (!req?.query?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await AppWiseSetting.findOne({
      _id: req?.query?.id,
    });

    if (!setting) {
      return res
        .status(200)
        .send({ status: false, message: 'setting not found' });
    }

    await setting.deleteOne();
    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.settingId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await AppWiseSetting.findById(req.query.settingId);
    if (req.query.type === 'google') {
      setting.googleLogin = !setting.googleLogin;
    } else if (req.query.type === 'quick') {
      setting.quickLogin = !setting.quickLogin;
    } else if (req.query.type === 'facebook') {
      setting.facebookLogin = !setting.facebookLogin;
    } else if (req.query.type === 'fakeCall') {
      setting.isFakeCall = !setting.isFakeCall;
    } else if (req.query.type === 'paytm') {
      setting.paytm = !setting.paytm;
    } else if (req.query.type === 'phonePe') {
      setting.phonePe = !setting.phonePe;
    } else if (req.query.type === 'googlePay') {
      setting.googlePay = !setting.googlePay;
    } else if (req.query.type === 'bhim') {
      setting.bhim = !setting.bhim;
    } else if (req.query.type === 'appAdStatus') {
      setting.appAdStatus = !setting.appAdStatus;
    } else if (req.query.type === 'appHowShowAds') {
      setting.appHowShowAds = !setting.appHowShowAds;
    } else if (req.query.type === 'appDialogBeforeAddShow') {
      setting.appDialogBeforeAddShow = !setting.appDialogBeforeAddShow;
    } else if (req?.query?.type === 'isFaceBook') {
      setting.facebook.isFaceBook = !setting.facebook.isFaceBook;
    } else if (req?.query?.type === 'isGoogle') {
      setting.google.isGoogle = !setting.google.isGoogle;
    } else if (req?.query?.type === 'appAdStatus') {
      setting.appAdStatus = !setting.appAdStatus;
    } else if (req?.query?.type === 'appHowShowAds') {
      setting.appHowShowAds = !setting.appHowShowAds;
    } else if (req?.query?.type === 'appDialogBeforeAddShow') {
      setting.appDialogBeforeAddShow = !setting.appDialogBeforeAddShow;
    } else {
      return res
        .status(200)
        .json({ status: false, message: 'type must be passed valid!' });
    }

    await setting.save();

    return res.status(200).send({ status: true, message: 'success', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get setting for admin penal
exports.getSetting = async (req, res) => {
  try {
    const setting = await AppWiseSetting.find();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get app wise setting using id
exports.getSettingById = async (req, res) => {
  try {
    if (!req?.query?.settingId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await AppWiseSetting.findById(req?.query?.settingId);

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
