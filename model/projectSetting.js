const mongoose = require('mongoose');
const { COMMISSION_TYPE } = require('../constent/enum');

const projectSettingSchema = new mongoose.Schema(
  {
    type: { type: Number, enum: [COMMISSION_TYPE], default: 1 },
    amountPercentage: { type: Number, default: 0 },
    upperAmount: { type: Number, default: 0 },
    lowerAmount: { type: Number, default: 0 },
    commissionPercentage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('projectSetting', projectSettingSchema);
