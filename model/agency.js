const mongoose = require('mongoose');
const { AGENCY_TYPE } = require('../constent/enum');

const agencySchema = new mongoose.Schema(
  {
    code: Number,
    password: String,
    fcm_token: { type: String, default: null },
    name: String,
    approveDate: String,
    email: { type: String, default: null },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    image: String,
    isDisable: { type: Boolean, default: false },
    forRandomCall: { type: Boolean, default: true },
    forLiveStreaming: { type: Boolean, default: true },
    mobileNo: String,
    receiveCoin: { type: Number, default: 0 },
    spendCoin: { type: Number, default: 0 },
    type: { type: Number, enum: AGENCY_TYPE, default: 1 }, // type for real or fake
    totalBalance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Agency', agencySchema);
