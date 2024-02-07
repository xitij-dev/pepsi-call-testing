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
const RandomMatchHost = require('../../model/randomMatchHost');
const RandomUserUserCall = require('../../model/randomUserUserCall');
const UserUserRandomCallArray = require('../../model/userUserRandomCallArray');

// Create a log file for today
// const {
//   createCustomLogFile,
//   writeLogMessage,
// } = require('../../util/logFunction');
// const logFile = createCustomLogFile();

exports.match = async (req, res) => {
  try {
    console.log('callMatch Api call ============', req?.query?.userId);

    if (!req?.query?.type || !req?.query?.userId || !req.query.uniqueValue) {
      return res
        .status(200)
        .json({ status: false, message: 'Type and UserId must be needed !' });
    }

    const user = await User.findById(req?.query?.userId);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User Not Found!' });
    }

    if (user.isBusy) {
      return res
        .status(200)
        .json({ status: false, message: "Oops Something want's wrong!" });
    }

    user.isBusy = true;
    user.uniqueValue = req.query.uniqueValue;
    await user.save();

    const existRandomMatch = await RandomMatchHost({
      userId: req.query.userId,
    });
    if (existRandomMatch) {
      console.log(
        'randomMatch already exist and deleted in randomMatch API =================='
      );
      await existRandomMatch.deleteOne();
    }

    const randomMatchHost = await new RandomMatchHost({
      userId: user._id,
      type: req?.query?.type,
    }).save();

    console.log(
      'randomMatchHost added in randomMatch API ===================================: ',
      randomMatchHost
    );

    if (req?.query?.type === 'female') {
      const job = queue
        .create('Pepsi-call-random', {
          userId: req?.query?.userId,
          type: req?.query?.type,
          count: 0,
          uniqueId: `${user.name}:${req?.query?.userId}`,
          uniqueValue: req.query.uniqueValue,
        })
        .removeOnComplete(true)
        .save(function (err) {
          if (!err) console.log('Job Add In Random Queue With ID: ', job.id);
        });
      res.status(200).json({
        status: true,
        message: 'Success',
        uniqueId: `${user.name}:${req?.query?.userId}`,
      });
    }

    if (req?.query?.type === 'male' || req?.query?.type === 'both') {
      res.status(200).json({
        status: true,
        message: 'Success',
        uniqueId: `${user.name}:${req?.query?.userId}`,
      });
      const result = await UserUserRandomCallArray.updateOne(
        { 'commanArray.userId': null },
        { $set: { 'commanArray.$.userId': user?._id } }
      );
      if (!result?.modifiedCount > 0) {
        console.log('........eeeeeeee..', Date.now());
        try {
          const result = await UserUserRandomCallArray.updateOne(
            {},
            {
              $push: {
                commanArray: {
                  $each: [
                    { userId: user?._id, uniqueValue: req.query.uniqueValue },
                    { userId: null, uniqueValue: req.query.uniqueValue },
                  ],
                },
              },
            }
          );
          console.log(
            'Document updated successfully in USERUSER-CALL:',
            result
          );
        } catch (err) {
          console.error('Error updating document:', err);
        }
      } else {
        console.log('CREATE QUE FOR USER_USER CALL ===', Date.now());
        const job = queue
          .create('Pepsi-user-user-call-random', {
            userId: req?.query?.userId,
            type: req?.query?.type,
            count: 0,
            uniqueId: `${user.name}:${req?.query?.userId}`,
            uniqueValue: req.query.uniqueValue,
          })
          .removeOnComplete(true)
          .save(function (err) {
            if (!err) {
              console.log('Job Add In Random Queue With ID: ', job.id);
            }
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

exports.randomMatchHost = async (
  userId,
  type,
  count,
  uniqueId,
  uniqueValue,
  id,
  done
) => {
  try {
    console.log(
      'randomMatchHost function called when queue for type FEMALE =========================='
    );

    const user = await User.findById(userId);
    console.log(
      'user caller in type female =================',
      user.name,
      user.uniqueValue
    );

    if (user?.recentConnectionId) {
      console.log(
        'user?.recentConnectionId ======================================='
      );
      done();
      return io.sockets.in(userId).emit('randomMatch', {}, null);
    }

    const availableHost = await Host.find({
      $and: [
        { isOnline: true },
        { isLive: false },
        { isBlock: false },
        { isBusy: false },
        { forRandomCall: true, type: 1 },
      ],
    }).countDocuments();

    var matchedHost = [];
    if (availableHost > 1) {
      console.log('available host > 1');

      const ids = await RandomMatchHistory.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(availableHost - 1);
      console.log('ids.length ==================', ids.length);

      matchedHost = await ids.map((data) => {
        return data.hostId;
      });

      console.log('matchedHost ==================', matchedHost);
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
        'randomHosts.length > 0 ==============',
        randomHosts[0].isBusy,
        randomHosts[0].name
      );

      const host = await Host.findById(randomHosts[0]._id);

      const outgoing = new History();
      outgoing.userId = user._id; // call user id
      outgoing.type = 3;
      outgoing.videoCallType = type;
      outgoing.hostId = host._id; // call receiver host id
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      outgoing.caller = 'user';
      outgoing.isRandom = true;

      const hostUpdate = await Host.updateOne(
        {
          _id: host?._id,
          isOnline: true,
          isBusy: false,
        },
        {
          isBusy: true,
          recentConnectionId: outgoing._id.toString(),
          uniqueValue: uniqueValue, //same as caller uniqueValue
        }
      );

      console.log(
        'hostUpdate?.modifiedCount ===================',
        hostUpdate?.modifiedCount
      );

      const randomMatchHostVerify = await RandomMatchHost.findOne({
        userId: user?._id,
        type: `female`,
      });

      if (randomMatchHostVerify) {
        console.log(
          'randomMatchHostVerify found ============================='
        );

        if (hostUpdate?.modifiedCount > 0) {
          console.log(
            'hostUpdate?.modifiedCount && randomMatchHostVerify =============',
            randomMatchHostVerify.type
          );

          const randomHistory = new RandomMatchHistory();

          randomHistory.userId = user._id;
          randomHistory.hostId = randomHosts[0]._id;
          randomHistory.callId = outgoing._id;
          randomHistory.date = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
          });

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
            uniqueValue,
          };

          const randomObj = { callId: outgoing._id.toString() };
          io.sockets
            .in('globalRoom:' + userId)
            .emit('randomQueCallId', randomObj);

          const hostVerify = await Host.findById(host?._id);
          if (hostVerify?.isOnline == true) {
            console.log(
              'hostVerify.isOnline ========================',
              hostVerify?.isOnline,
              hostVerify?.isBusy,
              hostVerify.recentConnectionId,
              hostVerify.uniqueValue
            );

            await randomHistory.save();
            await outgoing.save();

            user.isBusy = true;
            user.recentConnectionId = outgoing._id.toString();
            user.uniqueValue = uniqueValue; //caller uniqueValue
            await user.save();

            done();
            console.log(
              'after done  =================================================='
            );

            io.sockets
              .in('globalRoom:' + host._id.toString())
              .emit('callRequest', data, null);

            await randomMatchHostVerify?.deleteOne();
          } else {
            console.log(
              'hostVerify is not online ============================================ in hostverify else',
              hostVerify?.isOnline
            );

            setTimeout(async () => {
              return await this.randomMatchAgain(
                userId,
                type,
                count,
                uniqueId,
                id,
                done
              );
            }, 1000);
          }
        } else {
          console.log('host not updated ====================');

          setTimeout(async () => {
            return await this.randomMatchAgain(
              userId,
              type,
              count,
              uniqueId,
              uniqueValue,
              id,
              done
            );
          }, 2000);
        }
      } else {
        console.log(
          'randomMatchHostVerify not found ============================='
        );

        done();
      }
    } else {
      console.log('randomHosts.length < 0 ==============');

      setTimeout(async () => {
        return await this.randomMatchAgain(
          userId,
          type,
          count,
          uniqueId,
          uniqueValue,
          id,
          done
        );
      }, 2000);
    }
  } catch (error) {
    console.log(error);
    done(error);
  }
};

exports.randomMatchAgain = async (
  userId,
  type,
  count,
  uniqueId,
  uniqueValue,
  id,
  done
) => {
  console.log(
    'randomMatchAgain function called when queue for type FEMALE =========================='
  );

  const randomMatchHostVerify = await RandomMatchHost.findOne({
    userId: userId,
    type: `female`,
  });

  if (randomMatchHostVerify) {
    console.log(
      'randomMatchHostVerify in randomMatchAgain function ========================='
    );

    await this.randomMatchHost(
      userId,
      type,
      count,
      uniqueId,
      uniqueValue,
      id,
      done
    );
  } else {
    console.log(
      'else randomMatchHostVerify in randomMatchAgain function ========================='
    );
    done();
  }
};

exports.randomMatchUser = async (
  userId,
  type,
  count,
  uniqueId,
  uniqueValue,
  id,
  done
) => {
  try {
    console.log(
      'randomMatchUser function called when queue for type MALE or BOTH ================================='
    );

    const randomHostAvailable = await UserUserRandomCallArray.findOne({
      'commanArray.uniqueValue': uniqueValue,
    });
    let cArray = randomHostAvailable.commanArray;
    if (randomHostAvailable) {
      const indices = [];

      for (let i = 0; i < cArray.length; i++) {
        if (cArray[i].uniqueValue === uniqueValue) {
          indices.push(i);
          if (indices?.length == 2) break;
        }
      }

      if (indices.length == 2) {
        let user2Id =
          cArray[indices[0]].userId?.toString() == userId
            ? cArray[indices[1]].userId
            : cArray[indices[0]].userId;
        const user = await User.findById(userId);
        const user2 = await User.findById(user2Id);
        console.log(
          'RANDOM MATCH USER FUNCTION USERS NAME ===========',
          user?.uniqueValue,
          user.name,
          user2.name
        );

        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let channel = '';
        for (let i = 0; i < 8; i += 1) {
          channel += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length)
          );
        }

        const outgoing = new History();

        outgoing.userId = user._id; // call user id
        outgoing.type = 3;
        outgoing.videoCallType = type;
        outgoing.otherUserId = user2._id; // call receiver otherUser id
        outgoing.date = new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
        });
        outgoing.caller = 'user';
        outgoing.isRandom = true;

        const setting = await Setting.findOne({});

        const data = {
          callerId: user._id.toString(),
          receiverId: user2._id.toString(),
          callerName: user.name,
          receiverName: user2.name,
          callerImage: user.image,
          coin: user.callCharge,
          randomCallCharge: setting.chargeForMatchFemale,
          token: '',
          channel,
          live: user.isLive,
          callId: outgoing._id,
          uniqueValue, //caller uniqueValue
          callType: 'random',
          type: 'user',
          jobId: 1212,
        };
        const callMatchUser1Verify = await RandomMatchHost.findOne({
          userId: user._id,
          $or: [{ type: 'both' }, { type: 'male' }],
        });

        const callMatchUser2Verify = await RandomMatchHost.findOne({
          userId: user2._id,
          $or: [{ type: 'both' }, { type: 'male' }],
        });
        if (callMatchUser1Verify) {
          if (callMatchUser2Verify) {
            await outgoing.save();
            user.isBusy = true;
            user.recentConnectionId = outgoing._id;
            user.uniqueValue = uniqueValue; //caller uniqueValue
            await user.save();

            user2.isBusy = true;
            user2.recentConnectionId = outgoing._id;
            user2.uniqueValue = uniqueValue; //caller uniqueValue
            await user2.save();

            const socket1 = io
              .in(`globalRoom:${outgoing.userId.toString()}`)
              .fetchSockets();
            const socket2 = io
              .in(`globalRoom:${outgoing.otherUserId.toString()}`)
              .fetchSockets();

            socket1?.length
              ? socket1[0].join(outgoing._id?.toString())
              : console.log('socket1 not able to join');
            socket2?.length
              ? socket2[0].join(outgoing._id?.toString())
              : console.log('socket2 not able to join');

            io.in(outgoing._id?.toString()).emit('userUserCall', data, null);
            done();
          }
        }else{
          
        }
      } else {
        setTimeout(async () => {
          return await this.randomMatchUserAgain(
            userId,
            type,
            count,
            uniqueId,
            uniqueValue,
            id,
            done
          );
        }, 1000);
      }

      user.isBusy = true;
      user.recentConnectionId = outgoing._id;
      user.uniqueValue = uniqueValue; //caller uniqueValue
      await user.save();

      user2.isBusy = true;
      user2.recentConnectionId = outgoing._id;
      user2.uniqueValue = uniqueValue; //caller uniqueValue
      await user2.save();

      const [socket1, socket2] = await Promise.all([
        io.in(`globalRoom:${outgoing.userId.toString()}`).fetchSockets(),
        io.in(`globalRoom:${outgoing.otherUserId.toString()}`),
      ]);

      socket1?.length
        ? socket1[0].join(outgoing._id?.toString())
        : console.log('socket1 not able to emit');
      socket2?.length
        ? socket2[0].join(outgoing._id?.toString())
        : console.log('socket2 not able to emit');

      const callMatchUser1Verify = await RandomMatchHost.findOne({
        userId: user._id,
        $or: [{ type: 'both' }, { type: 'male' }],
      });

      const callMatchUser2Verify = await RandomMatchHost.findOne({
        userId: randomHostAvailable.userId,
        $or: [{ type: 'both' }, { type: 'male' }],
      });

      if (callMatchUser1Verify && callMatchUser2Verify) {
        console.log(
          'verify user 1 ============================================ , ',
          callMatchUser1Verify.userId,
          callMatchUser1Verify.type
        );

        console.log(
          'verify user 2 ============================================ , ',
          callMatchUser2Verify.userId,
          callMatchUser2Verify.type
        );

        io.in(outgoing._id?.toString()).emit('userUserCall', data, null);
        done();

        await callMatchUser1Verify.deleteOne();
        await callMatchUser2Verify.deleteOne();

        console.log(
          'callConnect ============================================',
          userId,
          outgoing.otherUserId
        );

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
        console.log('not verify ============================================');
        done();

        user.isBusy = false;
        user.recentConnectionId = null;
        user.uniqueValue = null;
        user.save();

        user2.isBusy = false;
        user2.recentConnectionId = null;
        user2.uniqueValue = null;
        user2.save();
      }
    } else {
      console.log('No randomHostAvailable  ==============');

      return await this.randomMatchUserAgain(
        userId,
        type,
        count,
        uniqueId,
        uniqueValue,
        id,
        done
      );
    }
  } catch (error) {
    done(error);
    console.log(error);
    return;
  }
};

exports.randomMatchUserAgain = async (
  userId,
  type,
  count,
  uniqueId,
  uniqueValue,
  id,
  done
) => {
  const randomMatchHostVerify = await RandomMatchHost.findOne({
    userId: userId,
  });

  if (!randomMatchHostVerify) {
    console.log(
      'randomUser does not avilable in randomMatchUserAgain =================',
      randomMatchHostVerify
    );
    done();
  } else {
    console.log(
      'randomMatchHostVerify in randomMatchAgain function ========================='
    );

    await this.randomMatchUser(
      userId,
      type,
      count,
      uniqueId,
      uniqueValue,
      randomUserUserCall,
      id,
      done
    );
  }
};

// old
// exports.match = async (req, res) => {
//   try {
//     if (!req?.query?.type || !req?.query?.userId) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'Type and UserId must be needed !' });
//     }

//     const user = await User.findById(req?.query?.userId);

//     if (!user) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'User Not Found !' });
//     }

//     if (user.isBusy) {
//       return res
//         .status(200)
//         .json({ status: false, message: "Oops Something want's wrong!" });
//     }

//     if (req?.query?.type === 'female') {
//       const job = queue
//         .create('Pepsi-call-random', {
//           userId: req?.query?.userId,
//           type: req?.query?.type,
//           count: 0,
//           uniqueId: ${user.name}:${req?.query?.userId},
//         })
//         .removeOnComplete(true)
//         .save(function (err) {
//           if (!err) console.log('Job Add In Random Queue With ID: ', job.id);
//         });
//     }

//     if (req?.query?.type === 'male' || req?.query?.type === 'both') {
//       const index = userToUserCallIds.findIndex(
//         (call) => call._id?.toString() === req?.query?.userId
//       );
//       if (index !== -1) {
//         console.log(
//           'userToUserCallIds index already exist in randomMatch API return  ==== '
//         );
//         return res.status(200).json({
//           status: true,
//           message: 'Success',
//           uniqueId: ${user.name}:${req?.query?.userId},
//         });
//       }
//       const job = queue
//         .create('Pepsi-user-user-call-random', {
//           userId: req?.query?.userId,
//           type: req?.query?.type,
//           count: 0,
//           uniqueId: ${user.name}:${req?.query?.userId},
//         })
//         .removeOnComplete(true)
//         .save(function (err) {
//           if (!err) console.log('Job Add In Random Queue With ID: ', job.id);
//         });
//     }
//     return res.status(200).json({
//       status: true,
//       message: 'Success',
//       uniqueId: ${user.name}:${req?.query?.userId},
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       message: error.message || 'Internal Server Error',
//     });
//   }
// };

// exports.randomMatchUser = async (userId, type, count, uniqueId, id, done) => {
//   try {
//     console.log('Function Call ========', userToUserCallIds?.length);

//     if (userToUserCallIds?.length == 2) {
//       console.log('userToUserCallIds?.length =========== 2222');

//       // Here, we have to connect call.
//       const user1 = userToUserCallIds[0];
//       const user2 = userToUserCallIds[1];
//       if (user1?.isBusy || user2?.isBusy) {
//         userToUserCallIds = [];
//         done(); // if user busy then end queue.
//         return true;
//       }

//       const outgoing = new History();
//       outgoing.userId = user1._id; // call user id
//       outgoing.type = 3;
//       outgoing.otherUserId = user2._id; // call receiver otherUser id
//       outgoing.date = new Date().toLocaleString('en-US', {
//         timeZone: 'Asia/Kolkata',
//       });
//       outgoing.caller = 'user';
//       outgoing.isRandom = true;
//       await outgoing.save();

//       // Busy both user first
//       user1.isBusy = true;
//       user2.isBusy = true;
//       user1.recentConnectionId = outgoing._id;
//       user2.recentConnectionId = outgoing._id;
//       await user1.save();
//       await user2.save();

//       const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//       let channel = '';
//       for (let i = 0; i < 8; i += 1) {
//         channel += randomChars.charAt(
//           Math.floor(Math.random() * randomChars.length)
//         );
//       }

//       const setting = await Setting.findOne({});
//       const data = {
//         callerId: user1._id.toString(),
//         receiverId: user2._id.toString(),
//         receiverName: user2.name,
//         callerName: user1.name,
//         callerImage: user1.image,
//         coin: user1.callCharge,
//         randomCallCharge: setting.chargeForMatchFemale,
//         token: '',
//         channel,
//         live: user1.isLive,
//         callId: outgoing._id,
//         callType: 'random',
//         type: 'user',
//         jobId: id,
//         uniqueId,
//       };

//       if (user1.isBusy && user2.isBusy) {
//         userToUserCallIds = [];
//         done();

//         await History.updateOne(
//           { _id: outgoing._id },
//           {
//             $set: {
//               callConnect: true,
//               callStartTime: new Date().toLocaleString('en-US', {
//                 timeZone: 'Asia/Kolkata',
//               }),
//             },
//           }
//         );
//         const socket1 = await io
//           .in(globalRoom:${outgoing.userId.toString()})
//           .fetchSockets();
//         const socket2 = await io
//           .in(globalRoom:${outgoing.otherUserId.toString()})
//           .fetchSockets();

//         // room create
//         socket1?.length
//           ? socket1[0].join(outgoing._id)
//           : console.log('socket1 not able to emit');
//         socket2?.length
//           ? socket2[0].join(outgoing._id)
//           : console.log('socket1 not able to emit');
//         // emit in call id room
//         console.log('callConnect ===========');

//         io.in(outgoing._id).emit('userUserCall', data, null);
//         return true;
//       }
//       user1.isBusy = false;
//       await user1.save();
//       user2.isBusy = false;
//       await user2.save();

//       if (count < 10) {
//         count += 2;
//         setTimeout(
//           async () =>
//             await this.randomMatchUserAgain(
//               userId,
//               type,
//               count,
//               uniqueId,
//               id,
//               done
//             ),
//           2000
//         );
//       }
//       // userToUserCallIds = [];
//     } else {
//       if (count < 10) {
//         count += 2;
//         setTimeout(
//           async () =>
//             await this.randomMatchUserAgain(
//               userId,
//               type,
//               count,
//               uniqueId,
//               id,
//               done
//             ),
//           2000
//         );
//       } else {
//         done();
//         return io.sockets
//           .in(globalRoom:${userId})
//           .emit('callRequest', null, 'No one is online');
//       }
//     }
//     // done();
//   } catch (error) {
//     console.log(error);
//     done();
//   }
// };

// exports.randomMatchUserAgain = async (
//   userId,
//   type,
//   count,
//   uniqueId,
//   id,
//   done
// ) => {
//   if (randomRemove.stop) {
//     done();
//     randomRemove.stop = false;
//   } else {
//     await this.randomMatchUser(userId, type, count, uniqueId, id, done);
//   }
// };
