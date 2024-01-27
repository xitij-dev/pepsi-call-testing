/* eslint-disable no-var */
/* eslint-disable vars-on-top */
const arraySort = require('array-sort');
const axios = require('axios');
const Country = require('../../model/country');
const Host = require('../../model/host');

// Get Country for Admin
exports.index = async (req, res) => {
  try {
    const country = await Country.find();
    const sortCountry = arraySort(country, 'name');

    return res.status(200).json({
      status: true,
      message: 'success',
      country: sortCountry,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};

// Create Country
exports.store = async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    const countries = response.data;

    var data = [];
    for (let index = 0; index < countries.length; index += 1) {
      const flag = countries[index].flags.png;
      const element = countries[index].name.common;
      data.push(element);
      const country = new Country();
      country.name = element;
      country.flag = flag;
      await country.save();
    }

    return res.status(200).json({
      status: true,
      message: 'success',
      country: data,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};

// hosts country  for android
exports.getCountryHostWise = async (req, res) => {
  try {
    const host = await Host.find({}).distinct('countryId');

    const country = await Country.find({ _id: { $in: host } }).sort({
      name: 1,
    });

    return res
      .status(200)
      .send({ status: true, message: 'success!!', country });
  } catch (error) {
    console.log(error);
  }
};
