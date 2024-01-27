const mongoose = require('mongoose');
const { TRANSACTION_STATUS } = require('../constent/enum');

const hostSettlementHistory = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Host',
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Agency',
    },
    coinEarned: { type: Number, default: 0 },
    bonusOrPenaltyAmount: { type: Number, default: 0 },
    statusOfTransaction: {
      type: Number,
      enum: [TRANSACTION_STATUS],
      default: 1,
    },
    totalCoinEarned: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    startDate: String,
    endDate: String,
    dollar: { type: Number, default: 0 },
    note: { type: String, default: '' },
    finalTotalAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model(
  'hostSettlementHistory',
  hostSettlementHistory
);
