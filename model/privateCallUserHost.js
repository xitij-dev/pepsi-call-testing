const mongoose = require('mongoose');

const PrivateCallUserHostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host' },
  isUser: { type: Boolean, default: false },
  type: { type: String, default: "" }
});

module.exports = mongoose.model(
  'PrivateCallUserHost',
  PrivateCallUserHostSchema
);









