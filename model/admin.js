const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    image: String,
    flag: { type: Boolean, default: false },
    role: { type: Array },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Admin', adminSchema);
