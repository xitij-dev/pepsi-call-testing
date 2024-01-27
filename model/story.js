const mongoose = require('mongoose');
const { STORY_TYPE, VIDEO_TYPE, PRIVIEW_TYPE } = require('../constent/enum');

const hostSchema = {
  hostId: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  image: String,
  country: String,
  flag: String,
};
const storySchema = new mongoose.Schema(
  {
    story: String,
    preview: { type: String, default: null },
    hostId: hostSchema,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    type: { type: Number, enum: [STORY_TYPE], default: 1 },
    typePrivew: { type: Number, enum: [STORY_TYPE], default: 1 },
    isFake: { type: Boolean, default: false },
    storyType: { type: Number, enum: [VIDEO_TYPE], default: null },
    previewType: { type: Number, enum: [PRIVIEW_TYPE], default: null },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  {
    timestamps: true,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('story', storySchema);
