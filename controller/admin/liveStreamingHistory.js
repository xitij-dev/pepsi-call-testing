/* eslint-disable one-var-declaration-per-line */
/* eslint-disable one-var */
const Host = require('../../model/host');
const LiveStreamingHistory = require('../../model/liveStreamingHistory');

// live streaming hisotry for admin penal
exports.hostAllHistory = async (req, res) => {
  try {
    if (!req?.query?.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;
    const host = await Host.findById(req?.query?.hostId);

    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host does not exists' });
    }
    let dateFilterQuery = {};
    let sDate, eDate;
    if (req.query.startDate !== 'ALL' && req.query.endDate !== 'ALL') {
      sDate = new Date(req.query.startDate);
      eDate = new Date(req.query.endDate);
      eDate.setHours(23, 59, 59, 999);
      // for date query
      dateFilterQuery = {
        analyticDate: { $gte: sDate, $lte: eDate },
      };
    }

    const history = await LiveStreamingHistory.aggregate([
      { $match: { hostId: host._id } },
      { $addFields: { analyticDate: '$createdAt' } },
      { $match: dateFilterQuery },
      {
        $sort: {
          analyticDate: -1,
        },
      },
      {
        $facet: {
          history: [
            { $skip: (start - 1) * limit }, // how many records you want to skip
            { $limit: limit },
          ],
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
          totalCoin: [{ $group: { _id: null, total: { $sum: '$coin' } } }],
        },
      },
    ]);
    return res.status(200).send({
      status: true,
      message: 'success!!',
      total: history[0].total[0]?.total > 0 ? history[0]?.total[0]?.total : 0,
      totalCoin:
        history[0]?.totalCoin[0]?.total > 0
          ? history[0]?.totalCoin[0]?.total
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
