const mongoose = require('mongoose');
const { TRANSACTION_STATUS } = require('../constent/enum');

const agencySettlementHistorySchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Agency',
    },
    agencyCommisionPercentage: { type: Number, default: 0 },
    statusOfTransaction: {
      type: Number,
      enum: [TRANSACTION_STATUS],
      default: 1,
    },
    bonusOrPenltyAmount: { type: Number, default: 0 },
    coinEarned: { type: Number, default: 0 },
    commissionCoinEarned: { type: Number, default: 0 },
    totalCoinEarned: { type: Number, default: 0 },
    startDate: String,
    endDate: String,
    amount: { type: Number, default: 0 },
    dollar: { type: Number, default: 0 },
    note: { type: String, default: '' },
    finalAmountTotal: { type: Number, default: 0 },
    availableCoinAfterPaid: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model(
  'agencySettlementHistory',
  agencySettlementHistorySchema
);
