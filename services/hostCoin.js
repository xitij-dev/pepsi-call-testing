const History = require('../model/history');
const Setting = require('../model/setting');
const Host = require('../model/host');
const User = require('../model/user');
const AppWiseSetting = require("../model/appWiseSetting")
const { roundNumber } = require('../util/roundNumber');

exports.hostCoinEarnedHistory = async (id) => {
  const history = await History.findById(id);
  const setting = await Setting.findOne({});
  const host = await Host.findById(history?.hostId);
  if (!history?.isHostReceviedCoin && history.hostId !== null) {
    if (history.isRandom && history.isPrivate) {
      const user = await User.findById(history?.userId);
      const appWiseSetting = await AppWiseSetting.findOne({
        packageName: user?.packageName,
      });
      const privateCallAmount =
        ((parseInt(history?.duration) - appWiseSetting.durationOfFreeCall) *
          setting.minPrivateCallCharge) /
        60;
      let randomPrivateAmount =
        privateCallAmount + appWiseSetting.chargeForMatchFemale;
      const numberP = await roundNumber(randomPrivateAmount, 'call');

      console.log(
        'numberrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
        numberP
      );
      history.hCoin = numberP;
      history.isHostReceviedCoin = true;
      await history.save();

      host.coin += numberP;
      host.receiveCoin += numberP;
      await host.save();
    } else if (history.isRandom) {
      const number = await roundNumber(history.uCoin, 'call');

      history.hCoin = number;
      history.isHostReceviedCoin = true;
      await history.save();
      host.coin += number;
      host.receiveCoin += number;
      await host.save();
    } else if (history.isPrivate) {
      const amount =
        (parseInt(history.duration) * setting.minPrivateCallCharge) / 60;
      const number = await roundNumber(amount, 'call');
      history.hCoin = number;
      history.isHostReceviedCoin = true;
      await history.save();
      host.coin += number;
      host.receiveCoin += number;
      await host.save();
    }
  }
};
