const jwt = require('jsonwebtoken');
const Agency = require('../model/agency');

module.exports = async (req, res, next) => {
  try {
    const bearerToken = req.get('Authorization');
    if (!bearerToken) {
      return res
        .status(200)
        .send({ status: false, message: 'You Are Not Authorized' });
    }

    const token = await jwt.verify(bearerToken, process?.env?.JWT_TOKEN);

    const agency = await Agency.findById(token._id);

    req.agency = agency;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
