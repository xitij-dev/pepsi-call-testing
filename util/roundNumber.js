const Setting = require('../model/setting');

exports.roundNumber = async (data, type) => {
  const setting = await Setting.findOne({});
  const tax = type === 'gift' ? setting.giftTax / 100 : setting.callTax / 100;
  // console.log(
  //   "    TAX        =============================== >  =================================== >   ",
  //   tax
  // );
  const taxAmount = data * tax;
  const number = data - taxAmount;
  return Math.floor(number);
};
