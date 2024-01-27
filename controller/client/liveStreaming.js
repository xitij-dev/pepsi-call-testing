const LiveStreamingHistory = require('../../model/liveStreamingHistory');
const moment = require('moment');

// get streaming summary
exports.getStreamingSummary = async (req, res) => {
  try {
    const liveStreamingHistory = await LiveStreamingHistory.findById(
      req.query.liveStreamingId
    ).populate('hostId');

    if (!liveStreamingHistory)
      return res
        .status(200)
        .json({ status: false, message: 'Live Streaming Id not Found!!' });

    if (liveStreamingHistory.duration == 0) {
      console.log('liveStreamingHistory.duration in if:    ');

      liveStreamingHistory.endTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      liveStreamingHistory.duration =
        moment.utc(
          moment(new Date(liveStreamingHistory.endTime)).diff(
            moment(new Date(liveStreamingHistory.startTime))
          )
        ) / 1000;

      await liveStreamingHistory.save();
    }

    return res.status(200).json({
      status: true,
      message: 'Success!!',
      liveStreamingHistory: {
        ...liveStreamingHistory._doc,
        hostId: liveStreamingHistory?.hostId?._id,
        name: liveStreamingHistory?.hostId?.name,
        image: liveStreamingHistory?.hostId?.profilePic,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'Server Error' });
  }
};
