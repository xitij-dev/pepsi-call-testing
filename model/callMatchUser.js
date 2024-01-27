const mongoose = require('mongoose');

const CallMatchUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isBusy: { type: Boolean, default: false },
});

module.exports = mongoose.model('CallMatchUser', CallMatchUserSchema);
