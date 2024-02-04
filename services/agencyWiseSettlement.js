const moment = require('moment');
const Host = require('../model/host');
const HostSettlementHistory = require('../model/hostSettlementHistory');
const AgencySettlementHistory = require('../model/agencySettlementHistory');
const ProjectSetting = require('../model/projectSetting');
const Setting = require('../model/setting');
const Agency = require('../model/agency');

// host settlemet by agency wise
exports.agencyWiseHostSettlement = async (req, res) => {
  try {
    // const agencyWiseHost = await Host.aggregate([
    //   { $match: { type: 1, isBlock: false } },
    //   { $group: { _id: '$agencyId', agency: { $push: '$$ROOT' } } },
    // ]);
    const agencyWiseHost = await Agency.aggregate([
      { $match: { type: 1, isDisable: false } },
    ]);

    const setting = await Setting.findOne({});
    for (let index = 0; index < agencyWiseHost.length; index += 1) {
      const agency = agencyWiseHost[index]._id;
      const hosts = await Host.find({ agencyId: agency._id, type: 1 });
      // const hosts = agencyWiseHost[index].agency;
      let hostCoin = 0;
      const hostData = [];
      for (let i = 0; i < hosts.length; i += 1) {
        const host = hosts[i];

        const hostLastHistory = await HostSettlementHistory.findOne({
          hostId: host._id,
        }).sort({ _id: -1 }); // find last recodr for get total final amonut

        let finalTotalCoin;
        if (!hostLastHistory) {
          finalTotalCoin = host?.coin;
        } else {
          finalTotalCoin = host?.coin + hostLastHistory?.finalTotalAmount;
        }
        const data = {
          hostId: host?._id,
          agencyId: agency,
          coinEarned: host?.coin,
          statusOfTransaction: 1,
          totalCoinEarned: host?.coin,
          amount: host?.coin,
          finalTotalAmount: finalTotalCoin,
          dollar: parseFloat(host?.coin / setting.coinPerDollar).toFixed(2),
          startDate: moment().startOf('isoWeek').format('YYYY-MM-DD'),
          endDate: moment().endOf('isoWeek').format('YYYY-MM-DD'),
        };

        console.log('host?.coin', host?.coin);
        // for update host coin
        await Host.findOneAndUpdate(
          { _id: host._id },
          {
            $set: {
              coin: 0,
              lastSettlementCoin: host?.coin,
            },
          },
          {
            new: true,
          }
        );

        hostData.push(data);
        hostCoin += host?.coin;
      }
      await HostSettlementHistory.insertMany(hostData);

      // for agency settlement history
      const agencyHistory = await AgencySettlementHistory.findOne({
        agencyId: agency,
      }).sort({ _id: 1 });

      let commission = 0;
      async function findCommission(coin) {
        const setting = await ProjectSetting.find().sort({
          upperAmount: 1,
        });
        // commission = setting[0].amountPercentage;
        await setting.map(async (data) => {
          if (coin >= data.upperAmount) {
            commission = data.amountPercentage;
            return 1;
          }
        });
      }

      await findCommission(hostCoin);
      console.log('commission', commission);
      let commissionCoin;
      commissionCoin = (hostCoin * commission) / 100;
      const newHistory = new AgencySettlementHistory();
      newHistory.agencyId = agency;
      newHistory.agencyCommisionPercentage = commission;
      newHistory.statusOfTransaction = 1;
      newHistory.coinEarned = hostCoin;
      newHistory.commissionCoinEarned = parseInt(commissionCoin.toFixed(2));
      newHistory.totalCoinEarned =
        newHistory.coinEarned + parseInt(newHistory.commissionCoinEarned);
      newHistory.amount = newHistory.totalCoinEarned;
      newHistory.availableCoinAfterPaid = newHistory.amount;
      newHistory.startDate = moment().startOf('isoWeek').format('YYYY-MM-DD');
      newHistory.endDate = moment().endOf('isoWeek').format('YYYY-MM-DD');
      newHistory.dollar = parseFloat(
        newHistory.amount / setting.coinPerDollar
      ).toFixed(2);
      if (agencyHistory) {
        newHistory.finalAmountTotal =
          newHistory.amount + agencyHistory?.finalAmountTotal;
      } else {
        newHistory.finalAmountTotal = newHistory.amount;
      }

      await newHistory.save();
    }
    return { status: true, message: 'success' };
  } catch (error) {
    console.log(error);
  }
};
