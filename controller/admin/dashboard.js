/* eslint-disable no-restricted-globals */
const moment = require('moment');
const User = require('../../model/user');
const Host = require('../../model/host');
const History = require('../../model/history');
const Agency = require('../../model/agency');
const AgencySettlementHistory = require('../../model/agencySettlementHistory');
const Setting = require('../../model/setting');
// total user and today or yesterdy wise user for admin panel
exports.totalUserForAdminPenal = async (req, res) => {
  try {
    // match for today
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const endOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1
    );

    // match for privies day
    const startOfPriviesDay = new Date(
      previousDate.getFullYear(),
      previousDate.getMonth(),
      previousDate.getDate()
    );
    const endOfPriviesDay = new Date(
      previousDate.getFullYear(),
      previousDate.getMonth(),
      previousDate.getDate() + 1
    );

    // match for month
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    let dateFilterQuery = {};
    // 0 for all total user
    if (req?.query?.startDate !== 'ALL' && req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const userData = await User.aggregate([
      {
        $match: {
          isDelete: false,
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
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const todayUsers = await User.aggregate([
      {
        $match: {
          isDelete: false,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const monthlyUser = await User.aggregate([
      {
        $match: {
          isDelete: false,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const totalFakeHost = await Host.aggregate([
      {
        $match: { type: 2 },
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
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const todayFakeHost = await Host.aggregate([
      {
        $match: {
          type: 2,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await History.aggregate([
      {
        $match: {
          type: 2,
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
        $group: {
          _id: null,
          total: { $sum: '$uCoin' },
        },
      },
    ]);

    const todayRevenue = await History.aggregate([
      {
        $match: {
          type: 2,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$uCoin' },
        },
      },
    ]);

    const priviousDayRevenue = await History.aggregate([
      {
        $match: {
          type: 2,
          createdAt: { $gte: startOfPriviesDay, $lte: endOfPriviesDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$uCoin' },
        },
      },
    ]);

    const totalPurchaseUser = await History.aggregate([
      {
        $match: {
          type: 2,
          planId: { $ne: null },
          userId: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$userId',
        },
      },
      {
        $count: 'totalCount',
      },
    ]);

    const onlineUser = await User.find({
      isOnline: true,
    }).countDocuments();
    return res.status(200).send({
      status: true,
      message: 'success!!',
      user: {
        totalUser: userData[0]?.total > 0 ? userData[0]?.total : 0,
        todayUser: todayUsers[0]?.total > 0 ? todayUsers[0]?.total : 0,
        onlineUser: onlineUser > 0 ? onlineUser : 0,
        monthlyUser: monthlyUser[0]?.total > 0 ? monthlyUser[0]?.total : 0,
        totalRevenue: totalRevenue[0]?.total > 0 ? totalRevenue[0]?.total : 0,
        todayRevenue: todayRevenue[0]?.total > 0 ? todayRevenue[0]?.total : 0,
        priviousDayRevenue:
          priviousDayRevenue[0]?.total > 0 ? priviousDayRevenue[0]?.total : 0,
        totalFakeHost:
          totalFakeHost[0]?.total > 0 ? totalFakeHost[0]?.total : 0,
        todayFakeHost: todayFakeHost[0]?.total > 0 ? todayFakeHost[0].total : 0,
        totalPurchaseUser:
          totalPurchaseUser[0]?.totalCount > 0
            ? totalPurchaseUser[0]?.totalCount
            : 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// total host with online busy or live for admin penal
exports.totalHostForAdminPenal = async (req, res) => {
  try {
    // match for today
    const currentDate = new Date();
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const endOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1
    );

    let dateFilterQuery = {};

    if (req?.query?.startDate !== 'ALL' && req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const totalRealHost = await Host.aggregate([
      {
        $match: { type: 1 },
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
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const todayRealHost = await Host.aggregate([
      {
        $match: {
          type: 1,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const online = await Host.find({
      isOnline: true,
      type: 1,
    }).countDocuments();
    const live = await Host.find({ isLive: true, type: 1 }).countDocuments();
    const busy = await Host.find({ isBusy: true, type: 1 }).countDocuments();

    return res.status(200).send({
      status: true,
      message: 'success!!',
      host: {
        totalRealHost:
          totalRealHost[0]?.total > 0 ? totalRealHost[0]?.total : 0,
        todayRealHost: todayRealHost[0]?.total > 0 ? todayRealHost[0].total : 0,
        online: online > 0 ? online : 0,
        live: live > 0 ? live : 0,
        busy: busy > 0 ? busy : 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// api for analitic chart in admin penal
exports.chartAnalyticForPenal = async (req, res) => {
  try {
    let dateFilterQuery = {};

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
    if (req?.query?.type === 'user') {
      const user = await User.aggregate([
        {
          $match: {
            _id: { $ne: null },
          },
        },
        {
          $addFields: {
            analytic: {
              $toDate: {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $dateToString: {
                          format: '%Y-%m-%d',
                          date: '$createdAt',
                        },
                      },
                      'T',
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
        { $match: dateFilterQuery },
        { $group: { _id: '$analytic', count: { $sum: 1 } } },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res.status(200).send({ status: true, message: 'success!!', user });
    }

    if (req?.query?.type === 'revenue') {
      const revenue = await History.aggregate([
        {
          $match: {
            type: 2,
          },
        },
        {
          $addFields: {
            analytic: {
              $toDate: {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $dateToString: {
                          format: '%Y-%m-%d',
                          date: '$createdAt',
                        },
                      },
                      'T',
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: '$analytic',
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res
        .status(200)
        .send({ status: true, message: 'success!!', revenue });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// host chart for agency penal
exports.hostOrSettlementChartForAgencyPenal = async (req, res) => {
  try {
    let dateFilterQuery = {};

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
    if (req?.query?.startDate !== 'ALL' || req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    if (req?.query?.type === 'host') {
      const host = await Host.aggregate([
        {
          $match: {
            agencyId: agency._id,
            type: 1,
          },
        },
        {
          $addFields: {
            analytic: {
              $toDate: {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $dateToString: {
                          format: '%Y-%m-%d',
                          date: '$createdAt',
                        },
                      },
                      'T',
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: '$analytic',
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res.status(200).send({ status: true, message: 'success!!', host });
    }
    if (req?.query?.type === 'settlement') {
      const settlement = await AgencySettlementHistory.aggregate([
        {
          $match: {
            agencyId: agency._id,
          },
        },
        {
          $addFields: {
            analytic: {
              $toDate: {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $dateToString: {
                          format: '%Y-%m-%d',
                          date: '$createdAt',
                        },
                      },
                      'T',
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $project: {
            _id: 1,
            startDate: 1,
            amount: 1,
          },
        },
      ]);
      return res
        .status(200)
        .send({ status: true, message: 'success!!', settlement });
    }

    return res.status(200).send({ status: false, message: 'Invalid details' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all agency settlement report for agency penal
exports.getAgencyRevenueForAgencyPenal = async (req, res) => {
  try {
    const { agencyId, type } = req?.query;
    if (!agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res
        .status(200)
        .send({ status: false, message: 'agency not found' });
    }
    const host = await Host.find({ agencyId: agency._id, type: 1 }).distinct(
      '_id'
    );

    const setting = await Setting.findOne({});
    const startDay = moment().startOf('day').format();
    const endDay = moment().endOf('day').format();

    const startOfWeek = moment().startOf('week').format();
    const endDayOfWeek = moment().endOf('week').format();

    const todayHistory = await History.aggregate([
      {
        $match: {
          hostId: { $in: host },
          type: { $in: [0, 3, 5] },
          hCoin: { $ne: 0 },
        },
      },
      {
        $addFields: {
          analytic: {
            $toDate: { $arrayElemAt: [{ $split: ['$date', ','] }, 0] },
          },
        },
      },
      {
        $match: {
          analytic: { $gte: new Date(startDay), $lte: new Date(endDay) },
        },
      },
      {
        $group: {
          _id: null,
          coin: { $sum: '$hCoin' },
        },
      },
    ]);

    const todayHistoryDollar = todayHistory[0]?.coin / setting.coinPerDollar;
    const weekHistory = await History.aggregate([
      {
        $match: {
          hostId: { $in: host },
          type: { $in: [0, 3, 5] },
          hCoin: { $ne: 0 },
        },
      },
      {
        $addFields: {
          analytic: {
            $toDate: { $arrayElemAt: [{ $split: ['$date', ','] }, 0] },
          },
        },
      },
      {
        $match: {
          analytic: {
            $gte: new Date(startOfWeek),
            $lte: new Date(endDayOfWeek),
          },
        },
      },
      {
        $group: {
          _id: null,
          coin: { $sum: '$hCoin' },
        },
      },
    ]);
    const weekHistoryDollar = weekHistory[0]?.coin / setting.coinPerDollar;
    const lastRevenue = await AgencySettlementHistory.findOne(
      {
        agencyId: agency._id,
      },
      {
        amount: 1,
        statusOfTransaction: 1,
        dollar: 1,
        availableCoinAfterPaid: 1,
      }
    )
      .sort({ _id: -1 })
      .limit(1);

    const agencyBalInDollar = lastRevenue
      ? lastRevenue.availableCoinAfterPaid / setting.coinPerDollar
      : 0;
    let dateFilterQuery = {};

    if (req?.query?.startDate !== 'ALL' && req?.query?.endDate !== 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        analytic: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const totalRealHost = await Host.aggregate([
      {
        $match: { agencyId: agency._id, type: 1 },
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
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const todayRealHost = await Host.aggregate([
      {
        $match: {
          agencyId: agency._id,
          type: 1,
          createdAt: { $gte: new Date(startDay), $lte: new Date(endDay) },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const online = await Host.find({
      agencyId: agency._id,
      isOnline: true,
    }).countDocuments();
    const live = await Host.find({
      agencyId: agency._id,
      isLive: true,
    }).countDocuments();
    const busy = await Host.find({
      agencyId: agency._id,
      isBusy: true,
    }).countDocuments();

    return res.status(200).send({
      status: true,
      message: 'success!!',
      response: {
        totalRealHost:
          totalRealHost[0]?.total > 0 ? totalRealHost[0]?.total : 0,
        todayRealHost: todayRealHost[0]?.total > 0 ? todayRealHost[0].total : 0,
        online: online > 0 ? online : 0,
        live: live > 0 ? live : 0,
        busy: busy > 0 ? busy : 0,
        todayRevenue: todayHistory[0]?.coin > 0 ? todayHistory[0]?.coin : 0,
        todayRevenueDollar:
          todayHistoryDollar > 0 ? Number(todayHistoryDollar.toFixed(1)) : 0,
        weekRevenue: weekHistory[0]?.coin > 0 ? weekHistory[0]?.coin : 0,
        weekRevenueDollar:
          weekHistoryDollar > 0 ? Number(weekHistoryDollar.toFixed(1)) : 0,
        lastRevenueCoin: lastRevenue,
        agencyBalInDollar: Number(agencyBalInDollar.toFixed(2)),
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
