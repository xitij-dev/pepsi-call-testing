const mongoose = require('mongoose');

const randomHistorySchema = new mongoose.Schema(
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
    callId: { type: mongoose.Schema.Types.ObjectId, ref: 'History' },
    isMiscall: { type: Boolean, default: true },
    date: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('RandomMatchHistory', randomHistorySchema);
