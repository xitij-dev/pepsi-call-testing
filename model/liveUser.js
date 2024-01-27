const mongoose = require('mongoose');

const liveUserSchema = new mongoose.Schema(
  {
    name: String,
    country: String,
    countryFlag: { type: String, default: '' },
    image: String,
    // view: { type: Array, default: [] },
    dob: String,
    token: String,
    channel: String,
    coin: Number,
    liveHostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host' },
    agoraUID: { type: Number, default: 0 },
    view: { type: Number, default: 0 },
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveStreamingHistory',
    },
    // isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('LiveUser', liveUserSchema);
