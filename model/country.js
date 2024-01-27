const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema(
  {
    name: String,
    flag: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Country', CountrySchema);
