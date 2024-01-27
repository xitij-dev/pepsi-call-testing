const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../constent/enum');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgencyId',
      default: null,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
      default: null,
    },
    notificationType: { type: Number, enum: NOTIFICATION_TYPE }, // 0.admin 1.feedback
    message: String,
    type: { type: String, default: null },
    title: String,
    image: { type: String, default: null },
    date: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
