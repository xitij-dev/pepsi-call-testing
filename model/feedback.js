const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
      default: null,
    },
    description: { type: String },
    adminDescription: { type: String, default: '' },
    screenshot: { type: String, default: null },
    contact: String,
    type: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7] }, // 1. recharge  2. gifting  3. stream  4.events  5. suggestions  6. resetPassword 7. others
    date: String,
    isSolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
module.exports = mongoose.model('Feedback', feedbackSchema);
