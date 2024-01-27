const mongoose = require('mongoose');

const VIPPlanSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    validity: Number,
    validityType: String,
    dollar: Number,
    rupee: Number,
    tag: String,
    productKey: String,
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('VIPPlan', VIPPlanSchema);
