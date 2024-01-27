/* eslint-disable object-shorthand */
const { default: mongoose } = require('mongoose');
const hostSettlementHistory = require('../../model/hostSettlementHistory');
const Setting = require('../../model/setting');
const Agency = require('../../model/agency');
const AgencySettlementHistory = require('../../model/agencySettlementHistory');

// update for paid host settlemet
exports.updatePaidSettlement = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const history = await hostSettlementHistory.findById(req?.params?.id);

    if (!history) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

    const agencySettlemet = await AgencySettlementHistory.findOne({
      agencyId: history.agencyId,
      startDate: history.startDate,
      endDate: history.endDate,
    });

    if (agencySettlemet.statusOfTransaction == 1) {
      return res
        .status(200)
        .send({ status: false, message: 'agency amount not paid by admin' });
    }

    if (
      parseInt(agencySettlemet.availableCoinAfterPaid) <
      parseInt(history.amount)
    ) {
      return res
        .status(200)
        .send({ status: false, message: 'Insuffecient balance' });
    }

    agencySettlemet.availableCoinAfterPaid -= parseInt(history.amount);
    await agencySettlemet.save();
    history.statusOfTransaction = 2;

    await history.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', history });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get agencywise host settlement  history for admin penal
exports.agencyWiseHostSettlement = async (req, res) => {
  try {
    if (!req?.query?.agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;
    let searchQuery = {};

    if (req?.query?.search != 'ALL') {
      searchQuery = {
        'host.name': { $regex: req?.query?.search, $options: 'i' },
      };
    }

    let dateFilterQuery = {};
    let sort = { _id: -1 };
    if (req?.query?.startDate !== 'ALL' && req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    switch (req?.query?.sort) {
      case 'coinEarned':
        sort = { coinEarned: parseInt(req.query?.sortType) || 1 };
        break;
      case 'commissionCoinEarned':
        sort = { commissionCoinEarned: parseInt(req.query?.sortType) || 1 };
        break;
      case 'totalCoinEarned':
        sort = { totalCoinEarned: parseInt(req.query?.sortType) || 1 };
        break;
      case 'amount':
        sort = { amount: parseInt(req.query?.sortType) || 1 };
        break;
      case 'dollar':
        sort = { dollar: parseInt(req.query?.sortType) || 1 };
        break;
      default:
        break;
    }

    const history = await hostSettlementHistory.aggregate([
      {
        $match: {
          agencyId: new mongoose.Types.ObjectId(req?.query?.agencyId),
        },
      },
      {
        $addFields: {
          analytic: { $toDate: '$startDate' },
        },
      },
      {
        $match: dateFilterQuery,
      },
      {
        $lookup: {
          from: 'agencies',
          as: 'agencyId',
          let: { agencyId: '$agencyId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$agencyId'],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$agencyId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'hosts',
          localField: 'hostId',
          foreignField: '_id',
          as: 'host',
        },
      },
      {
        $unwind: {
          path: '$host',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: searchQuery,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          history: [{ $skip: (start - 1) * limit }, { $limit: limit }],
          totalRevenue: [{ $group: { _id: null, total: { $sum: '$amount' } } }],
          historyCount: [{ $group: { _id: null, totalCount: { $sum: 1 } } }],
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      historyCount:
        history[0].historyCount[0]?.totalCount > 0
          ? history[0].historyCount[0]?.totalCount
          : 0,
      totalRevenue:
        history[0].totalRevenue[0]?.total > 0
          ? history[0].totalRevenue[0]?.total
          : 0,
      history: history[0].history,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// action for host settlement
exports.actionForHostSettlement = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    if (!req?.body?.bonusOrPenaltyAmount) {
      return res
        .status(200)
        .send({ status: false, message: 'penltyOrBonus us require' });
    }

    const setting = await Setting.findOne({});
    const data = await hostSettlementHistory.findOneAndUpdate(
      {
        _id: req?.params?.id,
      },
      {
        $set: {
          note: req?.body?.note,
        },
        $inc: {
          bonusOrPenaltyAmount: parseInt(req?.body?.bonusOrPenaltyAmount),
          amount: parseInt(req?.body?.bonusOrPenaltyAmount),
          finalTotalAmount: parseInt(req?.body?.bonusOrPenaltyAmount),
        },
      },
      {
        new: true,
      }
    );

    const history = await hostSettlementHistory.findById(data._id);
    history.dollar = parseFloat(history.amount / setting.coinPerDollar).toFixed(
      2
    );

    await history.save();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', history });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get pending or solved settlemet for agency penal
exports.pendingOrSolvedSettlement = async (req, res) => {
  try {
    if (!req?.query?.agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const agency = await Agency.findById(req?.query?.agencyId);
    if (!agency) {
      return res
        .status(200)
        .send({ status: false, message: 'agency not found' });
    }

    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;

    let searchingQuery = {};
    let sort = { _id: -1 };
    if (req?.query?.search !== 'ALL') {
      searchingQuery = {
        $or: [
          { 'hostId.name': { $regex: req?.query?.search, $options: 'i' } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$coinEarned' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$dollar' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$amount' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
        ],
      };
    }

    switch (req?.query?.sort) {
      case 'coinEarned':
        sort = { coinEarned: parseInt(req.query?.sortType) || 1 };
        break;
      case 'commissionCoinEarned':
        sort = { commissionCoinEarned: parseInt(req.query?.sortType) || 1 };
        break;
      case 'totalCoinEarned':
        sort = { totalCoinEarned: parseInt(req.query?.sortType) || 1 };
        break;
      case 'amount':
        sort = { amount: parseInt(req.query?.sortType) || 1 };
        break;
      case 'dollar':
        sort = { dollar: parseInt(req.query?.sortType) || 1 };
        break;
      default:
        break;
    }

    const history = await hostSettlementHistory.aggregate([
      {
        $match: {
          agencyId: agency._id,
          statusOfTransaction: parseInt(req?.query?.type),
        },
      },
      {
        $lookup: {
          from: 'hosts',
          as: 'hostId',
          let: { hostId: '$hostId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$hostId'],
                },
              },
            },
            {
              $project: {
                name: 1,
                uniqueId: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$hostId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: searchingQuery,
      },
      {
        $sort: sort,
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await hostSettlementHistory
      .find({
        agencyId: agency._id,
        statusOfTransaction: parseInt(req?.query?.type),
      })
      .countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', total, history });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
