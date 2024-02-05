const mongoose = require('mongoose');

const PrivateCallUserHostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host' },
  isUser: { type: Boolean, default: false }, // caller isUser or not
  isBusy: { type: Boolean, default: false },
  expirationDate: { type: Date, required: true, expires: 0 },
});

module.exports = mongoose.model(
  'PrivateCallUserHost',
  PrivateCallUserHostSchema
);
