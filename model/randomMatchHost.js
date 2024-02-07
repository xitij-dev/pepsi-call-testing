const mongoose = require('mongoose');

const randomMatchHostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isBusy: { type: Boolean, default: false },
  type: { type: String, default: '' },
});

module.exports = mongoose.model('randomMatchHost', randomMatchHostSchema);