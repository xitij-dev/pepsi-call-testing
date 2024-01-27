/* eslint-disable new-cap */
const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema(
  {
    coin: { type: Number, default: 0 },
    dollar: { type: Number, default: 0 },
    rupee: { type: Number, default: 0 },
    tag: String,
    productKey: String,
    extraCoin: { type: Number, default: 0 },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('coinPlan', coinSchema);
