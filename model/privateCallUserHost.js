const mongoose = require('mongoose');

const PrivateCallUserHostSchema = new mongoose.Schema({
  cArray: { type: Array, default: { userId: null, uniqueValue: null } },
});

module.exports = mongoose.model(
  'PrivateCallUserHost',
  PrivateCallUserHostSchema
);
