const mongoose = require('mongoose');

const purchaseVipPlanHistory = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'User',
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'vipPlan',
    },
    vipFlashCoinId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'vipFlashCoin',
    },
    expireDate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('vipPlanHistory', purchaseVipPlanHistory);
