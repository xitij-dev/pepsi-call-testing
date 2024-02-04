const mongoose = require('mongoose');

const CallMatchUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  isBusy: { type: Boolean, default: false },
});

module.exports = mongoose.model('CallMatchUser', CallMatchUserSchema);
