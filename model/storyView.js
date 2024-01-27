const mongoose = require('mongoose');

const storyViewSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'story',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// eslint-disable-next-line new-cap
module.exports = new mongoose.model('storyView', storyViewSchema);
