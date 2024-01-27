const mongoose = require('mongoose');

const redeemSchema = new mongoose.Schema(
  {
    agencyName: { type: String, default: null },
    hostName: { type: String, default: null },
    image: { type: Array, default: [] },
    settlementCoin: { type: Number, default: 0 },
    hostSalary: { type: Number, default: 0 },
    agencyCommission: { type: Number, default: 0 },
    subAgentCommission: { type: Number, default: 0 },
    subAgentName: { type: String, default: null },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      default: null,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
      default: null,
    },
    subAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAgent',
      default: null,
    },
    penaltyOrBonus: { type: Number, default: 0 },
    note: { type: String, default: null },
    total: { type: Number, default: 0 },
    dollar: { type: Number, default: 0 },
    uniqueId: { type: String, default: null },
    type: { type: String, default: null },
    startDate: String,
    endDate: String,
    isPay: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Redeem', redeemSchema);
