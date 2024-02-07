const mongoose = require('mongoose');

const UserUserRandomCallArraySchema = new mongoose.Schema({
  commanArray: {
    type: Array,
    default: { userId: null, uniqueValue: null, process: false },
  },
});

module.exports = mongoose.model(
  'userUserRandomCallArray',
  UserUserRandomCallArraySchema
);
