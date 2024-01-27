const mongoose = require('mongoose');

const UserStoryViewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    story: { type: Number, default: 0 },
    date: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('userStoryView', UserStoryViewSchema);
