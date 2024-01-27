const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
  {
    onlineHost: { type: Number, default: 0 },
    busyHost: { type: Number, default: 0 },
    liveHost: { type: Number, default: 0 },
    onlineUser: { type: Number, default: 0 },
    busyUser: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Data', dataSchema);
