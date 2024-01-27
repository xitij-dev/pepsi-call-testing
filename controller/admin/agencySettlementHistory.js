// get all agecy settlement history for admin panel

const { default: mongoose } = require('mongoose');
const Agency = require('../../model/agency');
const AgencySettlementHistory = require('../../model/agencySettlementHistory');
const Setting = require('../../model/setting');

// update agency settlement by successful paid
exports.updatePaidHistroy = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const history = await AgencySettlementHistory.findById(req?.params?.id);

    if (!history) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

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

// get agency settlement pending or solved in admin penal
exports.getPendingOrSolvedHistory = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;
    let searchingQuery = {};
    let dateFilterQuery = {};
    let sort = { _id: -1 };
    if (req?.query?.search != 'ALL') {
      searchingQuery = {
        $or: [
          { 'agencyId.name': { $regex: req?.query?.search, $options: 'i' } },
          {
            $regexMatch: {
              input: { $toString: '$coinEarned' },
              regex: req?.query?.search,
              options: 'i',
            },
          },
          {
            $regexMatch: {
              input: { $toString: '$dollar' },
              regex: req?.query?.search,
              options: 'i',
            },
          },
          {
            $regexMatch: {
              input: { $toString: '$amount' },
              regex: req?.query?.search,
              options: 'i',
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

    if (req?.query?.startDate != 'ALL' || req?.query?.endDate != 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);

      endDate.setDate(23, 59, 59, 999);

      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const history = await AgencySettlementHistory.aggregate([
      {
        $match: {
          statusOfTransaction: parseInt(req?.query?.type),
        },
      },
      {
        $addFields: {
          analytic: { $toDate: '$createdAt' },
        },
      },
      {
        $match: dateFilterQuery,
      },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agencyId',
        },
      },
      {
        $unwind: {
          path: '$agencyId',
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

    const historyCount = await AgencySettlementHistory.find({
      statusOfTransaction: parseInt(req?.query?.type),
    }).countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', historyCount, history });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all settlement for admin penal
exports.getAllSettlementHistory = async (req, res) => {
  try {
    const start = req?.query?.start || 1;
    const limit = req?.query?.limit || 20;
    const history = await AgencySettlementHistory.aggregate([
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
                _id: 0,
                code: 1,
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
        $group: {
          _id: '$startDate',
          totalAgency: { $sum: 1 },
          totalrevenue: { $sum: '$coinEarned' },
          totalCommission: { $sum: '$commissionCoinEarned' },
          penltyOrBonus: { $sum: '$bonusOrPenltyAmount' },
          total: { $sum: '$amount' },
          dollar: { $sum: '$dollar' },
          totalCoinEarned: { $sum: '$totalCoinEarned' },
          agencyCommisionPercentage: { $first: '$agencyCommisionPercentage' },
          startDate: { $first: '$startDate' },
          endDate: { $first: '$endDate' },
          agency: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 1,
          totalAgency: 1,
          totalrevenue: 1,
          totalCommission: {
            $round: ['$totalCommission', 2],
          },
          penltyOrBonus: 1,
          total: { $round: ['$total', 2] },
          dollar: { $round: ['$dollar', 2] },
          totalCoinEarned: { $round: ['$totalCoinEarned', 2] },
          agencyCommisionPercentage: {
            $round: ['$agencyCommisionPercentage', 2],
          },
          startDate: 1,
          endDate: 1,
          agency: 1,
        },
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);
    const historyCount = await AgencySettlementHistory.aggregate([
      {
        $group: {
          _id: '$startDate',
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      historyCount: historyCount.length,
      history,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// action for agency settlement
exports.actionForAgencySettlement = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const historyData = await AgencySettlementHistory.findById(req?.params?.id);
    if (!req?.body?.bonusOrPenltyAmount) {
      return res
        .status(200)
        .send({ status: false, message: 'penltyOrBonus us require' });
    }

    // const rupe =
    //   historyData.amount +
    //   (req?.body?.bonusOrPenltyAmount
    //     ? parseInt(req?.body?.bonusOrPenltyAmount)
    //     : 0);
    // if (rupe < 0) {
    //   return res
    //     .status(200)
    //     .send({ status: false, message: 'please entern valid penlty' });
    // }
    const setting = await Setting.findOne({});
    const data = await AgencySettlementHistory.findOneAndUpdate(
      {
        _id: req?.params?.id,
      },
      {
        $set: {
          note: req?.body?.note,
        },
        $inc: {
          bonusOrPenltyAmount: parseInt(req?.body?.bonusOrPenltyAmount),
          amount: parseInt(req?.body?.bonusOrPenltyAmount),
          availableCoinAfterPaid: parseInt(req?.body?.bonusOrPenltyAmount),
          finalAmountTotal: parseInt(req?.body?.bonusOrPenltyAmount),
        },
      },
      {
        new: true,
      }
    );

    const history = await AgencySettlementHistory.findById(data._id);
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

// get agency for all settelment info
exports.getAllAgencyInfo = async (req, res) => {
  try {
    if (!req?.query?.date) {
      return res
        .status(200)
        .send({ status: false, message: 'Invaild details' });
    }

    const history = await AgencySettlementHistory.find({
      startDate: req?.query?.date,
    }).populate('agencyId', 'code name');

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

// get agency wise settlement for agency penal
exports.agencySettlementForAgency = async (req, res) => {
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
    const history = await AgencySettlementHistory.aggregate([
      {
        $match: {
          agencyId: agency._id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'hostsettlementhistories',
          as: 'hostHistory',
          let: {
            agencyId: '$agencyId',
            sDate: '$startDate',
            eDate: '$endDate',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$agencyId', '$$agencyId'] },
                    { $gte: ['$startDate', '$$sDate'] },
                    { $lte: ['$startDate', '$$eDate'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$hostHistory',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          agencyId: 1,
          agencyCommisionPercentage: 1,
          statusOfTransaction: 1,
          bonusOrPenltyAmount: 1,
          coinEarned: 1,
          commissionCoinEarned: 1,
          totalCoinEarned: 1,
          startDate: 1,
          endDate: 1,
          amount: 1,
          dollar: 1,
          note: 1,
          finalAmountTotal: 1,
          totalHost: { $ifNull: ['$hostHistory.count', 0] },
        },
      },
      {
        $facet: {
          history: [{ $skip: (start - 1) * limit }, { $limit: limit }],
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      },
    ]);

    const total = await AgencySettlementHistory.find({
      agencyId: agency._id,
    }).countDocuments();
    return res.status(200).send({
      status: true,
      message: 'success!!',
      total: history[0]?.total[0]?.total > 0 ? history[0]?.total[0]?.total : 0,
      history: history[0]?.history,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all agecy settlent for new module in agency penal
exports.getAllAgencySettlemtforPayOuts = async (req, res) => {
  try {
    if (!req?.query?.agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;
    const agency = await Agency.findById(req?.query?.agencyId);
    if (!agency) {
      return res
        .status(200)
        .send({ status: false, message: 'agency not found' });
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate != 'ALL' || req?.query?.endDate != 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);

      endDate.setDate(23, 59, 59, 999);

      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const history = await AgencySettlementHistory.aggregate([
      {
        $match: {
          agencyId: agency._id,
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
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'hostsettlementhistories',
          as: 'hostHistory',
          let: {
            agencyId: '$agencyId',
            sDate: '$startDate',
            eDate: '$endDate',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$agencyId', '$$agencyId'] },
                    { $gte: ['$startDate', '$$sDate'] },
                    { $lte: ['$startDate', '$$eDate'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$hostHistory',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          agencyId: 1,
          agencyCommisionPercentage: 1,
          statusOfTransaction: 1,
          bonusOrPenltyAmount: 1,
          coinEarned: 1,
          commissionCoinEarned: 1,
          totalCoinEarned: 1,
          startDate: 1,
          endDate: 1,
          amount: 1,
          dollar: 1,
          note: 1,
          finalAmountTotal: 1,
          totalHost: { $ifNull: ['$hostHistory.count', 0] },
        },
      },
      {
        $skip: (start - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await AgencySettlementHistory.find({
      agencyId: agency._id,
    }).countDocuments();
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
