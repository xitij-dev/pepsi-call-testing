const mongoose = require('mongoose');

const randomUserUserCallSchema = new mongoose.Schema({
  user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, default: '' },
});

module.exports = mongoose.model('randomUserUserCall', randomUserUserCallSchema);
