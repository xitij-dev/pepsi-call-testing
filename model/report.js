const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    otherUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
      default: null,
    },
    description: String,
    type: String,
    date: { type: String, default: new Date().toLocaleString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Report', reportSchema);
