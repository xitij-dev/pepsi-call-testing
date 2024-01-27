const mongoose = require('mongoose');
const { MESSAGE_TYPE, CALL_TYPE } = require('../constent/enum');

const chatSchema = mongoose.Schema(
  {
    senderId: String,
    messageType: { type: Number, enum: MESSAGE_TYPE }, // 0 : image, 1 : video, 2 : audio, 3 : chat, 4 : gift , 5 : videoCall,
    callType: { type: Number, enum: CALL_TYPE, default: null }, // 1. receive , 2. decline , 3. missCall
    callDuration: { type: String, default: '00:00:00' },
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'History',
    },
    message: String,
    image: { type: String, default: null },
    video: { type: String, default: null },
    audio: { type: String, default: null },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatTopic' },
    type: String, // For Host or User
    date: String,
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Chat', chatSchema);
