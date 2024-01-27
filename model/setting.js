const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  callTax: { type: Number, default: 0 },

  giftTax: { type: Number, default: 0 },
  hostPrivacyPolicyLink: { type: String, default: '' },
  minPrivateCallCharge: { type: Number, default: 2400 },

  coinPerDollar: { type: Number, default: 0 },

  zigoId: { type: String, default: 'ZIGO ID' },
  zigoCertificate: { type: String, default: 'ZEGO CERTIFICATE' },
});

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('setting', settingSchema);
