/* eslint-disable no-unused-expressions */
/* eslint-disable no-else-return */
/* eslint-disable prefer-template */
/* eslint-disable object-shorthand */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable arrow-body-style */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-lonely-if */
/* eslint-disable no-global-assign */
/* eslint-disable no-return-await */
/* global io queue, userToUserCallIds */

const User = require('../../model/user');
const Host = require('../../model/host');
const Block = require('../../model/block');
const RandomMatchHistory = require('../../model/randomHistory');
const History = require('../../model/history');
const Setting = require('../../model/setting');
const randomRemove = require('../../util/randomRemove');
const queueProcess = require('../../util/stopQueueProcess');
const CallMatchUser = require('../../model/callMatchUser');

// Create a log file for today
// const {
//   createCustomLogFile,
//   writeLogMessage,
// } = require('../../util/logFunction');

// const logFile = createCustomLogFile();

exports.match = async (req, res) => {
  try {
    if (!req?.query?.type || !req?.query?.userId) {
      return res
        .status(200)
        .json({ status: false, message: 'Type and UserId must be needed !' });
    }

    const user = await User.findById(req?.query?.userId);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User Not Found !' });
    }

    if (user.isBusy) {
      return res
        .status(200)
        .json({ status: false, message: "Oops Something want's wrong!" });
    }

    if (req?.query?.type === 'female') {
      const job = queue
        .create('Pepsi-call-random-testing', {
          userId: req?.query?.userId,
          type: req?.query?.type,
          count: 0,
          uniqueId: `${user.name}:${req?.query?.userId}`,
        })
        .removeOnComplete(true)
        .save(function (err) {
          if (!err) console.log('Job Add In Random Queue With ID: ', job.id);
        });
    }

    if (req?.query?.type === 'male' || req?.query?.type === 'both') {
      // const index = userToUserCallIds.findIndex(
      //   (call) => call._id?.toString() === req?.query?.userId
      // );
      // if (index !== -1) {
      //   console.log(
      //     'userToUserCallIds index already exist in randomMatch API return  ==== '
      //   );

      //   return res.status(200).json({
      //     status: true,
      //     message: 'Success',
      //     uniqueId: `${user.name}:${req?.query?.userId}`,
      //   });
      // }
      await new CallMatchUser({
        userId: req?.query?.userId,
      }).save();
      const job = queue
        .create('Pepsi-testing', {
          userId: req?.query?.userId,
          type: req?.query?.type,
          count: 0,
          uniqueId: `${user.name}:${req?.query?.userId}`,
        })
        .removeOnComplete(true)
        .save(function (err) {
          if (!err) console.log('Job Add In Random Queue With ID: ', job.id);
        });

      console.log('CREATE QUE  by  : ', req?.query?.userId);
    }
    return res.status(200).json({
      status: true,
      message: 'Success',
      uniqueId: `${user.name}:${req?.query?.userId}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

exports.randomMatchHost = async (userId, type, count, uniqueId, id, done) => {
  try {
    queueProcess.stopQueueProcess = false;
    console.log('Random Match function ma aavyu', userId);
    const user = await User.findById(userId);
    if (user?.recentConnectionId) {
      console.log(
        'user in random call  ......... recentConnectionId ===true ...remove in matching'
      );
      done();
      return io.sockets.in(userId).emit('randomMatch', {}, null);
    }
    // user.isBusy = true;
    // await user.save();
    // if (user.isBusy) {
    //   done();
    //   return io.sockets.in(userId).emit("randomMatch", {}, null);
    // }

    const availableHost = await Host.find({
      $and: [
        { isOnline: true },
        { isLive: false },
        { isBlock: false },
        { isBusy: false },
        { forRandomCall: true, type: 1 },
      ],
    }).countDocuments();

    // console.log(
    //   "================================ available host count =================================",
    //   availableHost
    // );

    var matchedHost = [];
    if (availableHost > 1) {
      const ids = await RandomMatchHistory.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(availableHost - 1);
      matchedHost = await ids.map((data) => {
        return data.hostId;
      });
    }

    const randomHosts = await Host.find({
      $and: [
        { isOnline: true },
        { isLive: false },
        { _id: { $nin: matchedHost } },
        { isBlock: false },
        { isBusy: false },
        { forRandomCall: true, type: 1 },
      ],
    });

    if (randomHosts.length > 0) {
      console.log(
        ' <========================================== Matched user busy or not =================================> ',
        randomHosts[0].isBusy
      );
      const host = await Host.findById(randomHosts[0]._id);

      const outgoing = new History();
      outgoing.userId = user._id; // call user id
      outgoing.type = 3;

      outgoing.hostId = host._id; // call receiver host id
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      outgoing.caller = 'user';
      outgoing.isRandom = true;
      await outgoing.save();

      user.isBusy = true;
      user.recentConnectionId = outgoing._id.toString();
      await user.save();
      if (host.isBusy) {
        done();
        return io.sockets
          .in('globalRoom:' + userId)
          .emit('callRequest', null, 'No one is online');
      }
      host.isBusy = true;
      host.recentConnectionId = outgoing._id.toString();
      await host.save();

      const randomHistory = new RandomMatchHistory();
      randomHistory.userId = user._id;
      randomHistory.hostId = randomHosts[0]._id;
      randomHistory.callId = outgoing._id;
      randomHistory.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      await randomHistory.save();

      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let channel = '';
      for (let i = 0; i < 8; i += 1) {
        channel += randomChars.charAt(
          Math.floor(Math.random() * randomChars.length)
        );
      }

      const data = {
        callerId: user._id,
        receiverId: host._id.toString(),
        receiverName: host.name,
        receiverImage: host.profilePic,
        callerName: user.name,
        callerImage: user.name,
        coin: 600,
        privateCallCharge: host.callCharge,
        token: '',
        channel,
        live: host.isLive,
        callId: outgoing._id,
        callType: 'random',
        type: 'user',
        jobId: id,
        uniqueId,
      };

      const randomObj = {
        callId: outgoing._id.toString(),
      };

      io.sockets.in('globalRoom:' + userId).emit('randomQueCallId', randomObj);

      if (host.isBusy) {
        console.log(
          '============================>  Data match in random match <==================== ',
          data
        );
        done();
        // writeLogMessage(
        //   logFile,
        //   `random match emit in host id ====>>>>>>>>>>>>>>> ======>>>>>>>>>>>>>  Livehost:${host._id.toString()} with ${JSON.stringify(
        //     data
        //   )}  `,
        //   'Host',
        //   `Random Match Success`
        // );
        return io.sockets
          .in('globalRoom:' + host._id.toString())
          .emit('callRequest', data, null);
      } else {
        user.isBusy = false;
        user.recentConnectionId = null;
        await user.save();
        host.isBusy = false;
        host.recentConnectionId = null;
        await host.save();

        if (count < 10) {
          count += 2;
          setTimeout(async () => {
            return await this.randomMatchAgain(
              userId,
              type,
              count,
              uniqueId,
              id,
              done
            );
          }, 2000);
        }
      }
    } else {
      if (count < 10) {
        count += 2;
        setTimeout(async () => {
          return await this.randomMatchAgain(
            userId,
            type,
            count,
            uniqueId,
            id,
            done
          );
        }, 2000);
      } else {
        console.log('NO ONE IS ONLINE ');
        done();
        return io.sockets
          .in('globalRoom:' + userId)
          .emit('callRequest', null, 'No one is online');
      }
    }
  } catch (error) {
    console.log(error);
    done();
  }
};

exports.randomMatchUser = async (userId, type, count, uniqueId, id, done) => {
  try {
    console.log('Function Call ========', userToUserCallIds?.length);

    if (userToUserCallIds?.length == 2) {
      console.log('userToUserCallIds?.length =========== 2222');

      // Here, we have to connect call.
      const user1 = userToUserCallIds[0];
      const user2 = userToUserCallIds[1];
      if (user1?.isBusy || user2?.isBusy) {
        userToUserCallIds = [];
        done(); // if user busy then end queue.
        return true;
      }

      const outgoing = new History();
      outgoing.userId = user1._id; // call user id
      outgoing.type = 3;
      outgoing.otherUserId = user2._id; // call receiver otherUser id
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      outgoing.caller = 'user';
      outgoing.isRandom = true;
      await outgoing.save();

      // Busy both user first
      user1.isBusy = true;
      user2.isBusy = true;
      user1.recentConnectionId = outgoing._id;
      user2.recentConnectionId = outgoing._id;
      await user1.save();
      await user2.save();

      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let channel = '';
      for (let i = 0; i < 8; i += 1) {
        channel += randomChars.charAt(
          Math.floor(Math.random() * randomChars.length)
        );
      }

      const setting = await Setting.findOne({});
      const data = {
        callerId: user1._id.toString(),
        receiverId: user2._id.toString(),
        receiverName: user2.name,
        callerName: user1.name,
        callerImage: user1.image,
        coin: user1.callCharge,
        randomCallCharge: setting.chargeForMatchFemale,
        token: '',
        channel,
        live: user1.isLive,
        callId: outgoing._id,
        callType: 'random',
        type: 'user',
        jobId: id,
        uniqueId,
      };

      if (user1.isBusy && user2.isBusy) {
        userToUserCallIds = [];
        done();

        await History.updateOne(
          { _id: outgoing._id },
          {
            $set: {
              callConnect: true,
              callStartTime: new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata',
              }),
            },
          }
        );
        const socket1 = await io
          .in(`globalRoom:${outgoing.userId.toString()}`)
          .fetchSockets();
        const socket2 = await io
          .in(`globalRoom:${outgoing.otherUserId.toString()}`)
          .fetchSockets();

        // room create
        socket1?.length
          ? socket1[0].join(outgoing._id)
          : console.log('socket1 not able to emit');
        socket2?.length
          ? socket2[0].join(outgoing._id)
          : console.log('socket1 not able to emit');
        // emit in call id room
        console.log('callConnect ===========', data);
        const socketemit = await io.in(outgoing._id).fetchSockets();
        console.log('socket  ===========', socketemit?.length);
        io.in(outgoing._id).emit('userUserCall', data, null);
        return true;
      }
      user1.isBusy = false;
      await user1.save();
      user2.isBusy = false;
      await user2.save();

      if (count < 10) {
        count += 2;
        setTimeout(
          async () =>
            await this.randomMatchUserAgain(
              userId,
              type,
              count,
              uniqueId,
              id,
              done
            ),
          2000
        );
      }
      // userToUserCallIds = [];
    } else {
      if (count < 10) {
        count += 2;
        setTimeout(
          async () =>
            await this.randomMatchUserAgain(
              userId,
              type,
              count,
              uniqueId,
              id,
              done
            ),
          2000
        );
      } else {
        done();
        return io.sockets
          .in(`globalRoom:${userId}`)
          .emit('callRequest', null, 'No one is online');
      }
    }
    // done();
  } catch (error) {
    console.log(error);
    done();
  }
};

exports.randomMatchAgain = async (userId, type, count, uniqueId, id, done) => {
  if (randomRemove.stop) {
    done();
    randomRemove.stop = false;
  } else {
    await this.randomMatchHost(userId, type, count, uniqueId, id, done);
  }
};

exports.randomMatchUserAgain = async (
  userId,
  type,
  count,
  uniqueId,
  id,
  done
) => {
  if (randomRemove.stop) {
    done();
    randomRemove.stop = false;
  } else {
    await this.randomMatchUser(userId, type, count, uniqueId, id, done);
  }
};

exports.randomMatchTestingAgain = async (
  userId,
  type,
  count,
  uniqueId,
  id,
  done
) => {
  const available = await CallMatchUser.exists({ userId: userId });
  if (!available) {
    console.log('NOT AVAILBLE IN CALLMATCHUSER === ');
    done();
  } else {
    await this.makeCallHistory(userId, type, count, uniqueId, id, done);
  }
};

exports.makeCallHistory = async (userId, type, count, uniqueId, id, done) => {
  try {
    const callMatchUserCount = await CallMatchUser.find().countDocuments();
    console.log(
      'makeCallHistory api call ===========',
      userId,
      '===',
      callMatchUserCount
    );
    const callMatchAvailable = await CallMatchUser.findOne({
      userId: { $ne: userId },
      isBusy: false,
    });
    if (callMatchAvailable) {
      const user2 = await User.findById(callMatchAvailable?.userId);
      await callMatchAvailable.deleteOne();
      await CallMatchUser.deleteOne({ userId });
      queue.inactive(async function (err, ids) {
        console.log('inactive Ids ========= : ', ids);
        await new Promise((resolve, reject) => {
          ids.forEach(function (id) {
            // console.log("inactive job : ", id);
            kue.Job.get(id, function (err, job) {
              if (
                job.type === 'Pepsi-testing' &&
                job.data.userId === callMatchAvailable?.userId?.toString()
              ) {
                job.remove();
                console.log(
                  'remove thava aavyu ================',
                  job.data.userId
                );
                console.log('DONE =====================================');
                done();
              }
            });
          });
          resolve();
        });
      });

      const user = await User.findById(userId);

      const outgoing = new History();
      outgoing.userId = user._id; // call user id
      outgoing.type = 3;
      outgoing.otherUserId = user2._id; // call receiver otherUser id
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      outgoing.caller = 'user';
      outgoing.isRandom = true;
      await outgoing.save();

      // Busy both user first
      user.isBusy = true;
      user2.isBusy = true;
      user.recentConnectionId = outgoing._id;
      user2.recentConnectionId = outgoing._id;
      await user.save();
      await user2.save();

      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let channel = '';
      for (let i = 0; i < 8; i += 1) {
        channel += randomChars.charAt(
          Math.floor(Math.random() * randomChars.length)
        );
      }

      const setting = await Setting.findOne({});
      const data = {
        callerId: user._id.toString(),
        receiverId: user2._id.toString(),
        receiverName: user2.name,
        callerName: user.name,
        callerImage: user.image,
        coin: user.callCharge,
        randomCallCharge: setting.chargeForMatchFemale,
        token: '',
        channel,
        live: user.isLive,
        callId: outgoing._id,
        callType: 'random',
        type: 'user',
        jobId: 1212,
      };

      const socket1 = await io
        .in(`globalRoom:${outgoing.userId.toString()}`)
        .fetchSockets();
      const socket2 = await io
        .in(`globalRoom:${outgoing.otherUserId.toString()}`)
        .fetchSockets();

      socket1?.length
        ? socket1[0].join(outgoing._id?.toString())
        : console.log('socket1 not able to emit');
      socket2?.length
        ? socket2[0].join(outgoing._id?.toString())
        : console.log('socket1 not able to emit');
      // emit in call id room
      console.log(
        'callConnect ============================================',
        userId,
        outgoing.otherUserId
      );
      io.in(outgoing._id?.toString()).emit('userUserCall', data, null);
      await History.updateOne(
        { _id: outgoing._id },
        {
          $set: {
            callConnect: true,
            callStartTime: new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
            }),
          },
        }
      );
    } else {
      if (count < 10) {
        count += 2;
        setTimeout(async () => {
          return await this.randomMatchTestingAgain(
            userId,
            type,
            count,
            uniqueId,
            id,
            done
          );
        }, 2000);
      } else {
        console.log('NO ONE IS ONLINE ===');
        await CallMatchUser.deleteOne({ userId }); //@todo 'callRequest', null, 'No one is online' bahar kadhave chhe k nai first ask then
        done();
        return io.sockets
          .in('globalRoom:' + userId)
          .emit('callRequest', null, 'No one is online');
      }
    }
  } catch (error) {
    done();
    console.log(error);
    return;
  }
};

exports.queStop = async (req, res) => {
  console.log('QUE STOP API CALL ==============');
  queue.active(async function (err, ids) {
    console.log('active Ids ====: ', ids);
    await new Promise((resolve, reject) => {
      ids.forEach(function (id) {
        // console.log("active job : ", id);
        kue.Job.get(id, function (err, job) {
          console.log(job.data);
          // console.log("active job: ", job.data);
          if (
            job.type === 'Pepsi-call-random-testing' &&
            job.data.userId === req.query.userId
          ) {
            console.log('remove thava aavyu ');
            job.remove((error) => {
              if (error) {
                console.log('error on remove job ', error);
                return;
              } else {
                console.log('Job Remove Successfully......');
                queueProcess.stopQueueProcess = true;
                console.log(
                  'Job Remove Successfully......',
                  queueProcess.stopQueueProcess
                );
              }
              randomRemove.stop = true;
            });
          }
        });
      });
      resolve();
    });
  });
  queue.inactive(async function (err, ids) {
    console.log('inactive Ids ========= : ', ids);
    await new Promise((resolve, reject) => {
      ids.forEach(function (id) {
        // console.log("inactive job : ", id);
        kue.Job.get(id, function (err, job) {
          if (
            job.type === 'Pepsi-call-random-testing' &&
            job.data.userId === req.query.userId
          ) {
            console.log('remove thava aavyu ');
            job.remove(() => {
              randomRemove.stop = true;
            });
          }
        });
      });
      resolve();
    });
  });
  return res.json({ status: true });
};

exports.removeQue = async (req, res) => {
  try {
    console.log('REMOVE QUE API  LISTEN ============================ : ');
    const finalData = req.query; // JSON.parse(data_);
    await CallMatchUser.deleteOne({
      userId: finalData.userId,
    });
    let connectedHost;
    const user = await User.findById(finalData.userId);
    connectedHost = await User.findOne({
      _id: { $ne: user._id },
      recentConnectionId: user?.recentConnectionId,
    });
    const history = await History.findById(user.recentConnectionId);
    if (connectedHost) {
      if (history?.isPrivate) {
        connectedHost.isBusy = true;
      } else {
        connectedHost.isBusy = false;
        connectedHost.recentConnectionId = null;
      }
      await connectedHost.save();
      console.log(
        'callCancel emit ...........removeQueue............................. connectedHost._id.toString()   ',
        connectedHost._id.toString()
      );
      socket
        .in('globalRoom:' + connectedHost._id.toString())
        .emit('callCancel'); // @todo callCancel listen kare chhe k nai ... callconnect thya pachhi
    }
    if (user) {
      if (history?.isPrivate) {
        user.isBusy = true;
      } else {
        user.recentConnectionId = null;
        user.isBusy = false;
      }
      await user?.save();
    }
    queue.active(async function (err, ids) {
      await new Promise((resolve, reject) => {
        ids.forEach(function (id) {
          kue.Job.get(id, function (err, job) {
            if (
              job.type === 'Pepsi-testing' &&
              job.data.userId === finalData.userId
            ) {
              console.log('active Id ');
              console.log(
                'remove thava aavyu in removeQUE ==',
                finalData.userId
              );
              job.remove();
            }
          });
        });
        resolve();
      });
    });
    queue.inactive(async function (err, ids) {
      await new Promise((resolve, reject) => {
        ids.forEach(function (id) {
          kue.Job.get(id, function (err, job) {
            if (
              job.type === 'Pepsi-testing' &&
              job.data.userId === finalData.userId
            ) {
              console.log('inactive Id ');
              console.log('remove thava aavyu in removeQUE ', finalData.userId);
              job.remove();
            }
          });
        });
        resolve();
      });
    });
    return res.json({ status: true });
  } catch (e) {
    return res.json({ error: e });
  }
};
