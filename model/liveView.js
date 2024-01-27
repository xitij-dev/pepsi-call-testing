const mongoose = require('mongoose');

const LiveViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    image: String,
    agoraId: String,
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveStreamingHistory',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LiveView', LiveViewSchema);
