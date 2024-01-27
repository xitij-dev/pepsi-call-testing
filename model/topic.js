const mongoose = require('mongoose');
const { TOPIC_TYPE } = require('../constent/enum');

const topicSchema = new mongoose.Schema(
  {
    topic: { type: Array, default: [] },
    type: { type: Number, enum: [TOPIC_TYPE], default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('topic', topicSchema);
