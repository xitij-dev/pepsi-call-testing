/* eslint-disable no-self-assign */
const Setting = require('../../model/setting');
const AppWiseSetting = require('../../model/appWiseSetting');

exports.store = async (req, res) => {
  try {
    const setting = new Setting();

    await setting.save();

    return res.status(200).send({ status: true, message: 'success' });
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .send({ status: false, message: 'Internal server error' });
  }
};

// exports.handleSwitch = async (req, res) => {
//   try {
//     if (!req.query.settingId) {
//       return res
//         .status(200)
//         .send({ status: false, message: 'Invalid details' });
//     }

//     const setting = await Setting.findById(req.query.settingId);
//     if (req.query.type === 'google') {
//       setting.googleLogin = !setting.googleLogin;
//     } else if (req.query.type === 'quick') {
//       setting.quickLogin = !setting.quickLogin;
//     } else if (req.query.type === 'facebook') {
//       setting.facebookLogin = !setting.facebookLogin;
//     } else if (req.query.type === 'stripe') {
//       setting.stripeSwitch = !setting.stripeSwitch;
//     } else if (req.query.type === 'razorpay') {
//       setting.razorpaySwitch = !setting.razorpaySwitch;
//     } else if (req.query.type === 'fakeCall') {
//       setting.isFakeCall = !setting.isFakeCall;
//     } else if (req.query.type === 'upiPaySwitch') {
//       setting.upiPaySwitch = !setting.upiPaySwitch;
//     } else if (req.query.type === 'googleInAppSwitch') {
//       setting.googleInAppSwitch = !setting.googleInAppSwitch;
//     } else if (req.query.type === 'paytm') {
//       setting.paytm = !setting.paytm;
//     } else if (req.query.type === 'phonePe') {
//       setting.phonePe = !setting.phonePe;
//     } else if (req.query.type === 'googlePay') {
//       setting.googlePay = !setting.googlePay;
//     } else if (req.query.type === 'bhim') {
//       setting.bhim = !setting.bhim;
//     } else {
//       return res
//         .status(200)
//         .json({ status: false, message: 'type must be passed valid!' });
//     }

//     await setting.save();

//     return res.status(200).send({ status: true, message: 'success', setting });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(200)
//       .send({ status: false, message: 'Internal server error' });
//   }
// };

// exports.swichForAppActive = async (req, res) => {
//   try {
//     if (!req.query.settingId) {
//       return res
//         .status(200)
//         .send({ status: false, message: 'Invalid details' });
//     }

//     const setting = await Setting.findById(req.query.settingId);

//     setting.isAppActive = !setting.isAppActive;
//     await setting.save();
//     return res.status(200).send({ status: true, message: 'success', setting });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(200)
//       .send({ status: false, message: 'Internal server error' });
//   }
// };

// update setting fields
exports.update = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.settingId);

    setting.coinPerDollar = req.body.coinPerDollar
      ? req.body.coinPerDollar
      : setting.coinPerDollar;
    setting.hostPrivacyPolicyLink = req.body.hostPrivacyPolicyLink
      ? req.body.hostPrivacyPolicyLink
      : setting.hostPrivacyPolicyLink;
    setting.minPrivateCallCharge = req.body.minPrivateCallCharge
      ? req.body.minPrivateCallCharge
      : setting.minPrivateCallCharge;

    setting.giftTax = req.body.giftTax ? req.body.giftTax : setting.giftTax;
    setting.callTax = req.body.callTax ? req.body.callTax : setting.callTax;

    setting.zigoId = req.body.zigoId ? req.body.zigoId : setting.zigoId;
    setting.zigoCertificate = req.body.zigoCertificate
      ? req.body.zigoCertificate
      : setting.zigoCertificate;

    await setting.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', setting });
  } catch (error) {
    console.log(error);
  }
};

// get setting for adminpenal
exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({});

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

// get app wise setting for admin penal
exports.getAppWiseSetting = async (req, res) => {
  try {
    const AppSetting = await AppWiseSetting.findOne(
      {
        packageName: req?.query?.packageName,
      },
      {
        appAdStatus: 0,
        appHowShowAds: 0,
        appDialogBeforeAddShow: 0,
        faceBookId: 0,
        faceBookAPPSecreteId: 0,
        platformAPPId: 0,
        platformIns: 0,
        platformAPPOpen: 0,
        platformNative: 0,
        platformBanner: 0,
        platformRewarded: 0,
        platformOtherId: 0,
        facebook: 0,
        google: 0,
      }
    );

    const MonetizationSetting = await AppWiseSetting.findOne(
      {
        packageName: req?.query?.packageName,
      },
      {
        _id: 0,
        appAdStatus: 1,
        appHowShowAds: 1,
        appDialogBeforeAddShow: 1,
        facebook: 1,
        google: 1,
      }
    );
    if (!AppSetting) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

    const setting = await Setting.findOne({});

    const merge = { ...AppSetting._doc, ...setting._doc };

    return res.status(200).send({
      status: true,
      message: 'success!!',
      appSetting: merge,
      monetizationSetting: MonetizationSetting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
