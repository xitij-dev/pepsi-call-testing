const mongoose = require('mongoose');

const { Schema } = mongoose;

const flashCoinSchema = new Schema(
  {
    tag: String,
    coin: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    dollar: { type: Number, default: 0 },
    productKey: String,
    rupee: { type: Number, default: 0 },
    rupeeWithDiscount: { type: Number, default: 0 },
    image: { type: String, default: null },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('falshCoin', flashCoinSchema);
