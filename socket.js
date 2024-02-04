/* eslint-disable max-len */
/* eslint-disable object-shorthand */
/* eslint-disable one-var-declaration-per-line */
/* eslint-disable one-var */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-lonely-if */
/* eslint-disable no-else-return */
/* eslint-disable prefer-const */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable prefer-template */
/* eslint-disable camelcase */
/* eslint-disable no-constant-condition */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* global io queue */

const kue = require('kue');

// Models
const moment = require('moment');
const admin = require('firebase-admin');
const FCM = require('fcm-node');
const { default: mongoose } = require('mongoose');
const Gift = require('./model/gift');
const Host = require('./model/host');
const User = require('./model/user');
const History = require('./model/history');
const LiveView = require('./model/liveView');
const LiveUser = require('./model/liveUser');
const LiveStreamingHistory = require('./model/liveStreamingHistory');
const Notification = require('./model/notification');
const Data = require('./model/data');
const Setting = require('./model/setting');
const queueProcess = require('./util/stopQueueProcess');
const CallMatchUser = require('./model/callMatchUser');

// function
const { roundNumber } = require('./util/roundNumber');
const randomRemove = require('./util/randomRemove');

// FCM node

const fcm = new FCM(process?.env?.SERVER_KEY);

const room = 'globalRoom:';

const { hostCoinEarnedHistory } = require('./services/hostCoin');
const StoryView = require('./model/storyView');
const VipPlanHistory = require('./model/vipPlanHistory');

const serviceAccount = {
  type: 'service_account',
  project_id: 'pepsi-dcc36',
  private_key_id: 'dfe32c1807a1170b7bab745a86da34f8d745b628',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC52pjZF6M53KG9\nnJuzWIQGPGO4+iumM0ZA6gPK+iDZIWerYqI9nq1a3REe5XWgXtoHIvLIOskUqjns\nxZPwz+TbFzyzkzmeiP+EgIDZNVrJJYXXyScYrVY9BxaQppyMaJSQswEGevgGSKxd\nQk5s/LYvRgSc4fV6t0nJHPEMcYwH8N8F7smssdaRAbiXgOiCsmAdfkIk2UAE9urF\nef22wAQOR7ac7cYkZydFVJCaTxT5uKKt6j1qbelPqFiQduAS1DXTeLVk7+SMM2Fw\nXFd23Zd3wtEXODiTYtq6toRaVgJoPyM63feCH5vy0AfUUHwcxsVRmXPuAuTVpodx\nch79P2mrAgMBAAECggEAFsq09eKNNNpWx27+NSdEwZMEU7nyQmaFVg6cunakMpyD\nHyRwawgbkEoOAHD5VNps+HUTuvRilnMtuVidhOmp0ihuXENQzJ1WYIR1yK1fXc2J\nNWZIsiEHs2I8JS8ZgaqNlZUuKgJIilS9No6cGYeAPBnlFOws84iots4izXjbSFnO\nooo6imCzEKv+Md6uyLcGMzTA6bcIvNMKesbiNI/X/39HMtTw5R3susaapJwo+JUZ\ni7yra0PXbY56KvJa71XoIm6wSH7Mq9mr6JLl1OixXD0/5bBkNSUqtvUt92MOywy+\nh5ii4pgh5+++y0UMHShmYVNY6Tb/kdL96Y6wIA9+2QKBgQD70AHyfuiiEEeLSZEN\n0fXNUCziZiby2zn+SjbYBokYuXeHtWVyhOGdVo98VVxzpMV2oa2cmKomt9wizXdO\n2m3ZTqCPGsibSv8vHi50h2s1ww9zRonv3m2Qek9NDAxgWqoh8zoFd4mEZUxOXY1V\nB3o7oobmBiAApGp7Qtv4VimKjwKBgQC88cvvJQTRt0HXf2h1pBjinhTyF9JtJcuZ\nIPrwEOruytm3hF7lH9R5gZmeaFel/ZNjEAU7PkdKJTHcVnWmICIWDMwWIm43fffH\nm1G1M3epHyosMM2RDx8Fgm/qC4YNRAhz19UMBpqpsNGEbcDIibRDzs5yHMO/Dsiv\ngUnwCIjtJQKBgQCOl2gy4ChtdRh+SEdKcyVkgM0Z2sydYwTA+Vd7FqBVjtif0VlD\n8vkrNlQEDPZQSfLDTaRY854OVLjkQEMaNNhVYI/M2VbVkS9ViBq4Q+Kyy+UY2s3L\nNcIHOStkrrjnaw/CL9AgPmNxxEbkbVdV2ekekdcftEI0+uWNLPwQ8QGPAwKBgBcZ\nSGE4GVq6GKaLwO2A3jn2MYFXQDZvxHA4A/WNW+tNiUhSOnewaH1iRrGC+BQm5/nY\nX4talcSOv4W8XC2vB/vCHMEn/Gl0UPJqHpcUb7CRSsqUPM1bF+PIin4GYqEEjDP9\nUuJhfE76euLBuCvMCemwQrTYp2WYHRi3qZ5arMKxAoGBAM0RtKIAbj3oUbIV07/c\nN6pq4tvwmA7pn0cn3dJdA87p4MkQSY1wY8i1XH7loC+w0QYY11ns8D9udiEcH2R/\nJXJ5ZgnCrSt4ngvhUdWcOoTyt0cZj6+WaJGx9L3/cvBUFAWgHvMPIfsRuUZ6di5P\n4v2mRW/d+Ge4pqZzEhj7qS4e\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-2lsv4@pepsi-dcc36.iam.gserviceaccount.com',
  client_id: '112755819969236226086',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2lsv4%40pepsi-dcc36.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pepsi-dcc36-default-rtdb.firebaseio.com',
});

const db = admin.database();

global.usersRef = db.ref('liveUser');

const LiveUserFunction = async (host, data) => {
  host.name = data.name;
  host.country = data.countryId.name;
  host.countryFlag = data.countryId.flag;
  host.image = data.profileImage;
  host.token = data.token;
  host.channel = data.channel;
  host.coin = data.coin;
  host.liveHostId = data._id;
  host.dob = data.dob;

  await host.save();

  return host;
};

// Socket IO Connection
io.on('connect', async (socket) => {
  console.log('connectttttttttttttttttttttttttttttt socket');

  const { globalRoom } = socket.handshake.query;
  const id = globalRoom && globalRoom.split(':')[1];
  let liveRoom;
  let liveHostRoom;

  const { adminRoom } = socket.handshake.query;
  if (adminRoom) {
    console.log(
      `New ==================================== adminRoom ========  connected: ${socket.id}`
    );
  }
  console.log(
    `New ==================================== socket connected: ${socket.id}`
  );
  // Send a ping packet every `pingInterval` seconds
  let pingInterval = setInterval(() => {
    socket.emit('ping');
  }, 6000);

  let pingTimeout = setTimeout(() => {
    console.log('PING TIMOUT SOCKET DISCONNECT ====================', id);
    socket.disconnect(true);
  }, 14000);

  socket.on('pong', async () => {
    if (globalRoom) {
      const user = await User.findById(id);
      if (user && !user?.isOnline) {
        user.isOnline = true;
        await user.save();
      } else {
        const host = await Host.findById(id);
        if (host && !host?.isOnline) {
          host.isOnline = true;
          await host.save();
        }
      }
    }
    // Reset Ping Interval when pong is received
    clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 6000);
    // Reset the ping timeout when a pong is received
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => {
      console.log('PING TIMOUT SOCKET DISCONNECT ====================');
      socket.disconnect(true);
    }, 14000);
  });

  socket.join(globalRoom);
  socket.join(adminRoom);

  if (globalRoom) {
    const user = await User.findOne({ _id: id });

    if (user) {
      user.isOnline = true;
      user.globalState = 1;
      await user.save();

      if (user.isBlock) {
        io.in(`globalRoom:${id.toString()}`).emit('isBlock');
      }
    } else {
      const host = await Host.findOne({ _id: id });
      if (host) {
        host.isOnline = true;
        host.globalState = 1;
        await host.save();
      }
    }
  }

  // connect host in live room
  socket.on('liveRoomConnect', async (data) => {
    console.log(
      'liveRoomConnect  ma ayvuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
      data
    );
    const liveStream = await LiveStreamingHistory.findById(data.liveRoomId);
    let hostData;
    if (liveStream) {
      liveStream.startTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      await liveStream.save();
    }
    const host = await Host.findById(data.liveHostId);
    if (host) {
      host.isLive = true;
      await host.save();
    }

    socket.join(data.liveRoomId);

    io.in(data.liveRoomId).emit('liveRoomConnect', hostData);
  });
  // connect host in live room
  socket.on('liveRejoin', async (data) => {
    console.log('liveReJoin Listen ===============', data);
    if (data?.isVideo) {
      console.log('isVideo  ===============');

      socket.join(data?.callId);
    } else {
      socket.join(data?.liveRoomId);
      if (data.isLive) {
        console.log('data.live  ===============', data.isLive);
        let hostData;
        const host = await Host.findById(data?.liveHostId).populate(
          'countryId'
        );
        if (host) {
          host.isLive = true;
          await host.save();
        }
        const existLiveUser = await LiveUser.findOne({
          liveHostId: liveHostRoom,
        });

        if (!existLiveUser) {
          console.log(' not  existLiveUser ', host);
          // const liveUser = new LiveUser();
          // await LiveUserFunction(liveUser, host);
          //   let data2 = {
          //     liveHostId :host?._id.toString()
          //     liveRoomId :
          //   }
          //   usersRef
          //     .push(data) // This will create a new unique key for each user
          //     .then(() => {
          //       console.log('Data stored successfully in the database');
          //     })
          //     .catch((error) => {
          //       console.error('Error storing data:', error);
          //     });
          //   hostData = liveUser;
          // }
        }
      }
    }
  });

  socket.on('livePauseResume', async (data) => {
    console.log('livePauseResume listen  ==== ', data);
    const socket1 = await io.in(data.liveStreamingId).fetchSockets();
    console.log('socket1?.length', socket1?.length);
    io.to(data?.liveStreamingId).emit('livePauseResume', data);
  });

  // // pepsi-call-testing
  socket.on('removeQueue', async (data_) => {
    console.log('REMOVE QUE LISTEN ============================ : ', data_);
    const finalData = JSON.parse(data_);
    let connectedHost;

    const user = await User.findById(finalData.userId);
    const deleteUser = await CallMatchUser.deleteOne({
      userId: finalData.userId,
    });

    console.log('deleteUser == ', finalData.userId, deleteUser.deletedCount);
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
        .emit('callCancel');
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
      console.log('active Ids ========= in remove que : ', ids);
      await new Promise((resolve, reject) => {
        ids.forEach(function (id) {
          // console.log("inactive job : ", id);
          kue.Job.get(id, function (err, job) {
            if (
<<<<<<< HEAD
              job?.type === 'Pepsi-new-userUserCall' &&
=======
              job?.type === 'Pepsi-testing' &&
>>>>>>> d1e06f04616e32d61d05dc914cd97d9814c2be40
              job?.data.userId === finalData.userId?.toString()
            ) {
              job.remove((error) => {
                if (error) {
                  console.log('error on active remove job ', error);
                  return;
                } else {
                  console.log(
                    'remove thava aavyu ================active === in remove Que',
                    job?.id,
                    job.data.userId
                  );
                }
              });
            }
          });
        });
        resolve();
      });
    });
    queue.inactive(async function (err, ids) {
      console.log('inactive Ids ========= = in remove que: ', ids);
      await new Promise((resolve, reject) => {
        ids.forEach(async function (id) {
          // console.log("inactive job : ", id);
          kue.Job.get(id, async function (err, job) {
            if (
<<<<<<< HEAD
              job?.type === 'Pepsi-new-userUserCall' &&
=======
              job?.type === 'Pepsi-testing' &&
>>>>>>> d1e06f04616e32d61d05dc914cd97d9814c2be40
              job?.data?.userId === finalData.userId?.toString()
            ) {
              job.remove((error) => {
                if (error) {
                  console.log('error on inactive remove job ', error);
                  return;
                } else {
                  console.log(
                    'remove thava aavyu ================inactive=== in remove Que',
                    job.id,
                    job.data.userId
                  );
                }
              });
            }
          });
        });
        resolve();
      });
    });
  });

  // socket.on('removeQueue', async (data_) => {
  //   console.log('REMOVE QUE LISTEN ============================ : ', data_);
  //   const user = await User.findById(id);
  //   const finalData = JSON.parse(data_);
  //   const indexToRemove = userToUserCallIds.findIndex(
  //     (call) => call._id?.toString() === finalData?.userId
  //   );
  //   if (indexToRemove !== -1) {
  //     console.log(
  //       'userToUserCallIds index remove que ============================= ',
  //       indexToRemove
  //     );
  //     userToUserCallIds.splice(indexToRemove, 1); //if already caller is exist then remove
  //   }

  //   const history = await History.findById(user.recentConnectionId);
  //   let connectedHost;
  //   if (history?.hostId != null) {
  //     connectedHost = await Host.findOne({
  //       recentConnectionId: user?.recentConnectionId,
  //     });
  //   } else {
  //     connectedHost = await User.findOne({
  //       _id: { $ne: user._id },
  //       recentConnectionId: user?.recentConnectionId,
  //     });
  //   }
  //   if (connectedHost) {
  //     if (history?.isPrivate) {
  //       connectedHost.isBusy = true;
  //     } else {
  //       connectedHost.isBusy = false;
  //       connectedHost.recentConnectionId = null;
  //     }
  //     await connectedHost.save();
  //     console.log(
  //       'callCancel emit ...........removeQueue............................. connectedHost._id.toString()   ',
  //       connectedHost._id.toString()
  //     );

  //     socket
  //       .in('globalRoom:' + connectedHost._id.toString())
  //       .emit('callCancel');
  //   }
  //   if (user) {
  //     if (history?.isPrivate) {
  //       user.isBusy = true;
  //     } else {
  //       user.recentConnectionId = null;
  //       user.isBusy = false;
  //     }
  //     await user?.save();
  //   }

  //   queue.active(async function (err, ids) {
  //     console.log('active Ids : ', ids);
  //     await new Promise((resolve, reject) => {
  //       ids.forEach(function (id) {
  //         // console.log("active job : ", id);
  //         kue.Job.get(id, function (err, job) {
  //           // console.log("active job: ", job.data);
  //           if (
  //             (job.type === 'new-call-random' ||
  //               job.type === 'Pepsi-user-user-call-random') &&
  //             job.data.userId === finalData.userId
  //           ) {
  //             console.log('remove thava aavyu ');
  //             job.remove((error) => {
  //               if (error) {
  //                 console.log('error on remove job ', error);
  //                 return;
  //               } else {
  //                 console.log('Job Remove Successfully......');
  //                 queueProcess.stopQueueProcess = true;
  //                 console.log(
  //                   'Job Remove Successfully......',
  //                   queueProcess.stopQueueProcess
  //                 );
  //               }
  //               randomRemove.stop = true;
  //             });
  //           }
  //         });
  //       });
  //       resolve();
  //     });
  //   });
  //   queue.inactive(async function (err, ids) {
  //     console.log('inactive Ids : ', ids);
  //     await new Promise((resolve, reject) => {
  //       ids.forEach(function (id) {
  //         // console.log("inactive job : ", id);
  //         kue.Job.get(id, function (err, job) {
  //           // console.log("inactive job: ", job.data);
  //           if (
  //             (job.type === 'new-call-random' ||
  //               job.type === 'Pepsi-user-user-call-random') &&
  //             job.data.userId === finalData.userId
  //           ) {
  //             console.log('remove thava aavyu ');
  //             job.remove(() => {
  //               randomRemove.stop = true;
  //             });
  //           }
  //         });
  //       });
  //       resolve();
  //     });
  //   });
  //   if (connectedHost && !history?.isPrivate) {
  //     console.log(
  //       'callCancel emit ...........removeQueue............................. connectedHost._id.toString()   ',
  //       connectedHost._id.toString()
  //     );
  //     socket
  //       .in('globalRoom:' + connectedHost._id.toString())
  //       .emit('callCancel');
  //   }
  //   console.log(
  //     'removeQueue : host : ',
  //     connectedHost?.isBusy,
  //     connectedHost?.recentConnectionId
  //   );
  //   console.log(
  //     'removeQueue : user : ',
  //     user?.isBusy,
  //     user?.recentConnectionId
  //   );
  // });

  // Live Stream Comment

  socket.on('comment', async (data) => {
    console.log('comment listen  ==== ', data);
    const liveStreamingHistory = await LiveStreamingHistory.findById(
      data.liveStreamingId
    );

    if (liveStreamingHistory) {
      liveStreamingHistory.comments += 1;
      await liveStreamingHistory.save();
    }
    socket.join(data.liveStreamingId);
    io.in(data.liveStreamingId).emit('comment', data);
    const socket1 = await io.in(data.liveStreamingId).fetchSockets();
    console.log('socket in comment ', socket1?.length);
  });

  // Get Profile in live
  socket.on('getStoryView', async (data) => {
    const user = await User.findById(data.userId);

    const viewHistory = await StoryView.findOne({
      userId: data.userId,
      storyId: data.storyId,
    });

    let isVip;

    const vipPlan = await VipPlanHistory.findOne({
      userId: user._id,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
    if (vipPlan && vipPlan.expireDate > moment().toISOString()) {
      isVip = true;
    } else {
      isVip = false;
    }

    if (!viewHistory) {
      if (isVip) {
        const storyview = new StoryView();

        storyview.storyId = data.storyId;
        storyview.userId = user._id;

        await storyview.save();
        const userData = { ...user.toObject(), isVip: isVip };

        return io
          .in(`globalRoom:${data.userId.toString()}`)
          .emit('getStoryView', userData, null);
      } else {
        if (user.storyView < data.freeStoryCount) {
          user.storyView += 1;
          await user.save();
          const storyview = new StoryView();

          storyview.storyId = data.storyId;
          storyview.userId = user._id;

          await storyview.save();
          const userData = { ...user.toObject(), isVip: isVip };

          return io
            .in(`globalRoom:${data.userId.toString()}`)
            .emit('getStoryView', userData, null);
        }
      }
      return io
        .in(`globalRoom:${data.userId.toString()}`)
        .emit('getStoryView', null, isVip);
    }

    // eslint-disable-next-line object-shorthand
  });

  // Get Live Block List
  socket.on('blockedList', (data) => {
    io.in(liveRoom).emit('blockedList', data);
  });

  // Add View Socket
  socket.on('addView', async (data) => {
    const userRoom = 'globalRoom:' + data.userId.toString();
    const liveUser = await LiveUser.findOne({
      liveStreamingId: data.liveStreamingId,
    });
    if (liveUser) {
      liveUser.view += 1;
      await liveUser.save();
    }

    const socket1 = await io.in(userRoom).fetchSockets();
    socket1?.length
      ? socket1[0].join(data.liveStreamingId)
      : console.log('socket1 not able to emit');

    const user = await User.findById(data.userId);
    if (user) {
      // user.isBusy = true;
      await user.save();
    }

    const liveView = await LiveView();

    liveView.userId = data.userId;
    liveView.name = data.name;
    liveView.image = data.image;
    liveView.liveStreamingId = data.liveStreamingId;

    await liveView.save();

    const liveView_ = await LiveView.aggregate([
      {
        $match: {
          liveStreamingId: new mongoose.Types.ObjectId(data.liveStreamingId),
        },
      },
    ]);

    if (liveView_.length === 0) {
      return io.in(data.liveStreamingId).emit('view', []);
    }

    io.in(data.liveStreamingId).emit('view', liveView_);
  });

  // Less View Socket
  socket.on('lessView', async (data) => {
    console.log(
      'lessss view ma aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaayyyyyyyyyyyyvuuuuuuuuuuuuuuuu',
      data
    );
    const userRoom = 'globalRoom:' + data.userId.toString();
    const liveView = await LiveView.findOne({
      $and: [
        { userId: data.userId },
        { liveStreamingId: data.liveStreamingId },
      ],
    });

    if (liveView) {
      await liveView.deleteOne();
    }
    const liveUser = await LiveUser.findOneAndUpdate(
      {
        liveStreamingId: data?.liveStreamingId,
      },
      { $inc: { view: -1 } },
      { new: true }
    ).lean();

    const user = await User.findById(data.userId);
    if (user) {
      user.isBusy = false;
      await user.save();
    }

    const view_ = await LiveView.find({
      liveStreamingId: data.liveStreamingId,
    });

    if (view_.length === 0) return io.in(data.liveStreamingId).emit('view', []);

    const socket1 = await io.in(userRoom).fetchSockets();
    socket1?.length
      ? socket1[0].leave(data.liveStreamingId)
      : console.log('socket1 not able to emit');

    io.in(data.liveStreamingId).emit('view', view_);
  });

  // normal user send gift during live streaming [put entry on income and outgoing collection]
  socket.on('normalUserGift', async (data) => {
    const giftData = JSON.parse(data);
    console.log('data in gift: ', giftData);

    const gifts = JSON.parse(giftData.gift);

    let senderUser = await User.findById(giftData.senderUserId);

    let receiverHost;

    if (giftData.isHost) {
      receiverHost = await Host.findById(giftData.receiverUserId);
    } else {
      receiverHost = await User.findById(giftData.receiverUserId);
    }

    const gift = await Gift.findById(gifts._id);
    const totalCoin = giftData.giftCount * giftData.coin;
    const number = await roundNumber(totalCoin, 'gift');
    console.log(
      'users Exists >>>>',
      totalCoin,
      number,
      senderUser?._id,
      receiverHost?._id
    );

    if (senderUser && receiverHost) {
      console.log('users Exists >>>>');
      if (senderUser.coin < totalCoin) {
        console.log('users Exists >>>> totalCoin');
        if (giftData.video) {
          if (!giftData.isHost) {
            // emit seperatly because both users not connected in callId room
            io.in('globalRoom:' + giftData.receiverUserId).emit(
              'gift',
              null,
              null,
              null,
              'Insufficent diamonds'
            );
            io.in('globalRoom:' + giftData.senderUserId).emit(
              'gift',
              null,
              null,
              null,
              'Insufficent diamonds'
            );
            return;
          } else {
            return io
              .in(giftData.callId)
              .emit('gift', null, null, null, 'Insufficent diamonds');
          }
        } else {
          return io
            .in(giftData.liveStreamingId)
            .emit('gift', null, null, null, 'Insufficent diamonds');
        }
      }

      senderUser.coin -= totalCoin;
      await senderUser.save();

      if (giftData.isHost) {
        receiverHost.coin += number;
        receiverHost.receiveCoin += number;
        receiverHost.receiveGift += 1;
        await receiverHost.save();
      }
      const vipPlan = await VipPlanHistory.findOne({
        userId: senderUser._id,
        isActive: true,
      }).sort({
        createdAt: -1,
      });
      senderUser = { ...senderUser?._doc, isVip: vipPlan ? true : false };
      console.log('senderUser === 😀😀😀😀😀😀😀😀😀', senderUser);
      if (giftData.video) {
        console.log(
          '😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀'
        );
        if (!giftData.isHost) {
          console.log('userUserCall gift ');

          // emit seperatly because both users not connected in callId room
          io.in('globalRoom:' + giftData.senderUserId).emit(
            'gift',
            giftData,
            senderUser,
            receiverHost
          );
          io.in('globalRoom:' + giftData.receiverUserId).emit(
            'gift',
            giftData,
            senderUser,
            receiverHost
          );
        } else {
          io.in(giftData.callId).emit(
            'gift',
            giftData,
            senderUser,
            receiverHost
          );
        }
      } else {
        io.in(giftData.liveStreamingId).emit(
          'gift',
          giftData,
          senderUser,
          receiverHost
        );
      }

      if (!giftData.video) {
        const liveHost = await LiveUser.findOne({
          liveHostId: receiverHost._id,
        });

        liveHost.coin += number;
        await liveHost.save();
      }

      const outgoing = new History();

      outgoing.userId = senderUser._id;
      outgoing.uCoin = totalCoin;

      if (giftData.isHost) {
        outgoing.hCoin = number;
        outgoing.hostId = receiverHost._id;
      } else {
        outgoing.otherUserId = receiverHost._id;
      }
      outgoing.type = giftData.type;
      outgoing.callUniqueId = giftData.video ? data.callId : null;
      outgoing.giftId = gift._id;
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      await outgoing.save();

      if (giftData.liveStreamingId) {
        const liveStreamingHistory = await LiveStreamingHistory.findById(
          giftData.liveStreamingId
        );

        if (liveStreamingHistory) {
          liveStreamingHistory.coin += giftData.coin;
          liveStreamingHistory.gifts += 1;
          liveStreamingHistory.endTime = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
          });
          await liveStreamingHistory.save();
        }
      }
    }
  });
  // normal user send gift during live streaming [put entry on income and outgoing collection]
  socket.on('liveUserGift', async (data) => {
    const giftData = JSON.parse(data);
    console.log('data in liveUserGift: ', giftData);
    const senderHost = await User.findById(giftData?.senderUserId);
    if (giftData?.video) {
      let receiverUser = await Host.findById(giftData?.receiverUserId);
      io.in(giftData?.callId).emit('gift', giftData, senderHost, receiverUser);
    } else {
      return io
        .in(giftData?.liveStreamingId)
        .emit('gift', giftData, senderHost, senderHost);
    }
  });

  socket.on('appRestart', async (data) => {
    io.in(room + data.hostId).emit('appRestart', 'bbbbb');
  });

  // host or user is logout in app
  socket.on('logOut', async (data) => {
    const host = await Host.findById(data.id);
    if (host) {
      host.isLive = false;
      host.isOnline = false;
      host.isBusy = false;
      await host.save();
      await LiveUser.deleteOne({ liveHostId: host?._id });
    }
    const user = await User.findById(data.id);
    if (user) {
      user.isOnline = false;
      user.isLive = false;
      user.isBusy = false;

      await user.save();
    }
  });

  // ------------------- Video Call Socket -------------------

  // call end reason
  socket.on('endReason', async (data) => {
    console.log('endReason listen ====');
    const query = callRoom;

    const history = await History.findById(query);
    if (!history.callEndReason) {
      history.callEndReason = callRoom ? 'C_' + data : 'V_' + data;
      await history.save();
    } else {
      history_callEndReason =
        history.callEndReason + '/' + callRoom ? 'C_' + data : 'V_' + data;
      await history.save();
    }
  });

  socket.on('callConfirmed', async (data) => {
    console.log('Data in call Confirm ==========================> ', data);

    const room = 'globalRoom:' + data.callerId.toString();
    if (room) {
      io.in(room).emit('callConfirmed', data);
    }
    let callerUser;
    if (data.type == 'user') {
      callerUser = await User.findOne({ _id: data.callerId });
    } else {
      callerUser = await Host.findOne({ _id: data.callerId });
    }
    if (callerUser?.recentConnectionId !== data?.callId) {
      console.log(
        'callCancel emit in call Confirm ==========================> ',
        data.receiverId
      );

      io.in('globalRoom' + data.receiverId).emit('callCancel', data);
      return;
    }
  });

  // Call Answer Socket
  socket.on('callAnswer', async (data) => {
    console.log('Data in call Answer ==========================> ', data);
    const callerIdRoom = 'globalRoom:' + data.callerId.toString();
    const receiverIdRoom = 'globalRoom:' + data.receiverId.toString();

    let user, host, receiverAvailable;
    if (data.type == 'user') {
      console.log('type =====user');
      user = await User.findById(data.callerId);
      const hostData = await Host.findById(data.receiverId);
      const userData = await User.findById(data.receiverId);

      if (hostData) {
        host = hostData;
      } else {
        host = userData;
      }
      if (user.recentConnectionId == data.callId) {
        receiverAvailable = true;
      } else {
        receiverAvailable = false;
      }
    } else {
      console.log('type =====Host  ');
      host = await Host.findById(data.callerId);
      user = await User.findById(data.receiverId);
      if (host.recentConnectionId == data.callId) {
        receiverAvailable = true;
      } else {
        receiverAvailable = false;
      }
    }
    const jsonString = JSON.stringify(data);

    if (!data.isAccept) {
      usersRef
        .orderByChild('liveHostId')
        .equalTo(host?._id.toString())
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            const keyToUpdate = Object.keys(snapshot.val())[0];
            const existingData = snapshot.val()[keyToUpdate];
            const newData = {
              ...existingData,
              isBusy: false,
            };
            console.log(
              '==================isBusy update false ==========',
              host?.name
            );
            return usersRef.child(keyToUpdate).update(newData);
          } else {
            console.log('No matching data found in  false  ====');
          }
        })
        .then(() => {
          console.log('isBusy field updated successfully');
        })
        .catch((error) => {
          console.error('Error updating isBusy field:', error);
        });

      if (!receiverAvailable) {
        console.log(
          'receiver unavailable............recentConnection and callId different ',
          host.name,
          user.name
        );
        if (callerIdRoom) {
          io.in(callerIdRoom).emit('callAnswer', data);
          // writeLogMessage(logFile, jsonString, 'Emit Data', 'callAnswer event');
        }
        if (data.type == 'user') {
          if (host) {
            host.isBusy = false;
            host.recentConnectionId = null;
            await host.save();
          }
        } else {
          if (user) {
            user.isBusy = false;
            user.recentConnectionId = null;
            await user.save();
          }
        }
      } else {
        console.log(
          'receiver available ........... receiver call decline ',
          host.name,
          user.name
        );
        if (host) {
          host.isBusy = false;
          host.recentConnectionId = null;
          await host.save();
        }
        if (user) {
          user.isBusy = false;
          user.recentConnectionId = null;
          await user.save();
        }
        if (callerIdRoom) {
          io.in(callerIdRoom).emit('callAnswer', data);
          // writeLogMessage(logFile, jsonString, 'Emit Data', 'callAnswer event');
        }
      }
    } else {
      if (host.recentConnectionId == data.callId) {
        usersRef
          .orderByChild('liveHostId')
          .equalTo(host._id.toString())
          .once('value')
          .then((snapshot) => {
            if (snapshot.exists()) {
              const keyToUpdate = Object.keys(snapshot.val())[0];
              const existingData = snapshot.val()[keyToUpdate];
              const newData = {
                ...existingData,
                isBusy: true,
              };
              console.log(
                '==================isBusy update ==========',
                host?.name
              );
              return usersRef.child(keyToUpdate).update(newData);
            } else {
              console.log('No matching data found in callAPI  ====');
            }
          })
          .then(() => {
            console.log('isBusy field updated successfully');
          })
          .catch((error) => {
            console.error('Error updating isBusy field:', error);
          });

        if (callerIdRoom) {
          console.log('callAnswer  emit ..........', callerIdRoom);

          io.in(callerIdRoom).emit('callAnswer', data);
          // writeLogMessage(logFile, jsonString, 'Emit Data', 'callAnswer event');
        }
        console.log(
          'receiver available ........... receiver call accept......... ',
          host.name,
          user.name
        );

        const socket1 = await io.in(callerIdRoom).fetchSockets();
        const socket2 = await io.in(receiverIdRoom).fetchSockets();
        socket1?.length
          ? socket1[0].join(data.callId)
          : console.log('socket1 not able to emit');

        socket2?.length
          ? socket2[0].join(data.callId)
          : console.log('socket2 not able to emit');

        const history = await History.findById(data.callId);

        if (history && history.count == 0) {
          await History.findOneAndUpdate(
            { _id: data.callId },
            {
              $set: {
                count: 1,
                callConnect: true,
                // isPrivate: true,
                callStartTime: new Date().toLocaleString('en-US', {
                  timeZone: 'Asia/Kolkata',
                }),
              },
            },
            // { callConnect: true },
            // { isPrivate: true },
            // {
            // callStartTime: new Date().toLocaleString('en-US', {
            //   timeZone: 'Asia/Kolkata',
            // }),
            // },
            { new: true }
          );

          const user = await User.findById(history.userId);
          let host;
          if (history.hostId != null) {
            host = await Host.findById(history?.hostId);
          } else {
            host = await User.findById(history?.otherUserId);
          }

          // if (user) {
          //   user.isBusy = true;
          //   await user.save();
          // }
          // if (host) {
          //   host.isBusy = true;
          //   // host.isLive = false;
          //   await host.save();
          // }
        }
      } else {
        console.log(
          'callCancel emit ...........call answer.............................receiver ID  host.recentConnectionId == data.callId',
          data.receiverId
        );
        // writeLogMessage(
        //   logFile,
        //   `${data?.receiverId} data.receiverId `,
        //   'callCancel EMIT .......',
        //   'call answer >>>>'
        // );
        io.in('globalRoom' + data.receiverId).emit('callCancel', data);
      }
    }
    console.log(
      'CALLAnswer  : host : =============== ',
      host?.isBusy,
      host?.recentConnectionId
    );
    console.log(
      'CALLAnswer : user : =============== ',
      user?.isBusy,
      user?.recentConnectionId
    );
  });

  socket.on('vChat', async (data) => {
    io.in(videoCall).emit('vChat', data);
  });

  socket.on('liveContinue', async (data) => {
    const host = await Host.findById(data.hostId);
    const liveStreaming = await LiveStreamingHistory.findById(
      data.liveStreamingId
    );
    if (liveStreaming) {
      liveStreaming.midTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      liveStreaming.endTime = null;
      await liveStreaming.save();
    }

    if (host) {
      host.isLive = true;
      host.isOnline = true;
      host.isBusy = true;

      await host.save();
      setTimeout(async () => {
        host.connect = false;
        await host.save();
      }, 5000);
    }
  });

  // end live for host
  socket.on('endLiveHost', async (data) => {
    console.log(
      'endLiveHost  ma ayvuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
      data
    );

    const liveStreamingHistory = await LiveStreamingHistory.findById(
      data.liveRoomId
    );

    if (liveStreamingHistory && !liveStreamingHistory.endTime) {
      liveStreamingHistory.endTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      liveStreamingHistory.duration =
        liveStreamingHistory.duration > 0
          ? liveStreamingHistory.midTime
            ? liveStreamingHistory.duration +
              moment.utc(
                moment(new Date(liveStreamingHistory.endTime)).diff(
                  moment(new Date(liveStreamingHistory.midTime))
                )
              ) /
                1000
            : liveStreamingHistory.duration
          : liveStreamingHistory.startTime
          ? moment.utc(
              moment(new Date(liveStreamingHistory.endTime)).diff(
                moment(new Date(liveStreamingHistory.startTime))
              )
            ) / 1000
          : 0;
      await liveStreamingHistory.save();
    }

    const liveUser = await LiveUser.findOne({
      liveHostId: liveStreamingHistory.hostId,
    });
    io.in(data?.liveRoomId).emit(
      'endLiveHost',
      liveStreamingHistory ? liveStreamingHistory?.duration : 0,
      liveUser ? liveUser?.view : 0
    );
    io.socketsLeave(data?.liveRoomId);

    const host = await Host.findById(liveStreamingHistory.hostId);
    host.isLive = false;
    await host.save();
    if (liveUser) {
      await LiveView.deleteMany({
        liveStreamingId: liveUser.liveStreamingId,
      });

      await liveUser.deleteOne();
    }

    // instant back from the screen
    if (data?.firebaseId) {
      usersRef
        .child(data?.firebaseId)
        .remove()
        .then(() => {
          console.log('Data removed successfully');
        })
        .catch((error) => {
          console.error('Error removing data:', error);
        });
    } else {
      usersRef
        .orderByChild('liveHostId')
        .equalTo(liveStreamingHistory?.hostId.toString())
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            const keyToRemove = Object.keys(snapshot.val())[0];
            return usersRef.child(keyToRemove).remove();
          } else {
            console.log('No matching data found');
          }
        })
        .then(() => {
          console.log('Data removed successfully in disconnect in endLiveHost');
        })
        .catch((error) => {
          console.error(
            'Error removing data in disconnect in  endLiveHost',
            error
          );
        });
    }
  });

  // Call Disconnect Socket
  socket.on('callDisconnect', async (data) => {
    console.log('CALL DISCONNECT >>>>>>>>>>', data);
    // writeLogMessage(
    //   logFile,
    //   `${data.callId} , data.callId `,
    //   'callDisconnect EMIT .......... ',
    //   'callDisconnect >>>>'
    // );

    socket.in(data.callId).emit('callDisconnect', data?.callId);
    const history = await History.findById(data?.callId);

    let userIdRoom = 'globalRoom:' + history?.userId.toString();
    let hostIdRoom, host, user;
    if (history?.hostId != null) {
      hostIdRoom = 'globalRoom:' + history?.hostId.toString();
      host = await Host.findById(history?.hostId);
    } else {
      hostIdRoom = 'globalRoom:' + history?.otherUserId.toString();
      host = await User.findById(history?.otherUserId);
    }

    user = await User.findById(history?.userId);
    console.log(
      '+++++++++++++++++++++++++++++++++',
      userIdRoom,
      hostIdRoom,
      history._id
    );
    const socket1 = await io.in(userIdRoom).fetchSockets();
    const socket2 = await io.in(hostIdRoom).fetchSockets();

    // writeLogMessage(
    //   logFile,
    //   `${data?.callId} `,
    //   'zegoDisconnect EMIT',
    //   'CALL DISCONNECT >>>>'
    // );
    console.log(
      'CALL DISCONNECT emit >>>>>>>>>>    zegoDisconnect',
      data?.callId
    );
    io.to(data?.callId).emit('zegoDisconnect', data?.callId);

    socket1?.length
      ? socket1[0].leave(data?.callId)
      : console.log('Nothing socket1');
    socket2?.length
      ? socket2[0].leave(data?.callId)
      : console.log('Nothing socket2');

    const abcd = io.sockets.adapter.rooms.get(data?.callId);
    console.log(abcd, 'CALL DISCONNECT  EVENT LISTEN ......');

    if (data?.callId) {
      await History.updateOne(
        { _id: data?.callId },
        { $set: { count: 2 } },

        { new: true }
      );
    }

    if (history.caller == 'user') {
      if (user.recentConnectionId == data.callId) {
        if (user) {
          user.isBusy = false;
          user.recentConnectionId = null;
          await user.save();
        }
      }
      if (host.recentConnectionId == data.callId) {
        if (host) {
          host.isBusy = false;
          host.recentConnectionId = null;
          await host.save();
        }
      }
    } else {
      if (host.recentConnectionId == data.callId) {
        if (host) {
          host.isBusy = false;
          host.recentConnectionId = null;
          await host.save();
        }
      }
      if (user.recentConnectionId == data.callId) {
        if (user) {
          user.isBusy = false;
          user.recentConnectionId = null;
          await user.save();
        }
      }
    }
    if (host) {
      usersRef
        .orderByChild('liveHostId')
        .equalTo(host._id.toString())
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            const keyToUpdate = Object.keys(snapshot.val())[0];
            const existingData = snapshot.val()[keyToUpdate];
            const newData = {
              ...existingData,
              isBusy: false,
            };
            console.log(
              '==================isBusy update false callDisconnect ==========',
              host?.name
            );
            return usersRef.child(keyToUpdate).update(newData);
          } else {
            console.log(
              'No matching data found in  false callDisconnect  ===='
            );
          }
        })
        .then(() => {
          console.log('isBusy field updated successfully callDisconnect');
        })
        .catch((error) => {
          console.error('Error updating isBusy field: callDisconnect', error);
        });
    }
    if (data?.callId && !history.callEndTime && history.callStartTime) {
      const history_ = await History.findOneAndUpdate(
        { _id: data?.callId, callEndTime: { $eq: null } },
        {
          $set: {
            callEndTime: new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
            }),
          },
        },
        { new: true }
      );

      if (history_) {
        history_.duration = history_.callEndTime
          ? moment.utc(
              moment(new Date(history_.callEndTime)).diff(
                moment(new Date(history_.callStartTime))
              )
            ) / 1000
          : 0;

        await history_.save();
        await hostCoinEarnedHistory(history_?._id);
      }
    }
    console.log(
      'CALLDISCONNECT   : host : =============== ',
      host?.isBusy,
      host?.recentConnectionId
    );
    console.log(
      'CALLDISCONNECT : user : =============== ',
      user?.isBusy,
      user?.recentConnectionId
    );
  });

  // when user coin cut in call
  socket.on('userCoinCut', async (data) => {
    console.log('userCoinCut :  =============== ', data);
    const user = await User.findById(data?.userId);

    if (user?.coin > data?.coin) {
      user.coin -= data?.coin;
      await user.save();

      const history = await History.findById(data?.callId);
      history.uCoin += data?.coin;
      if (data.type === 'private') {
        history.isPrivate = true;
      }
      await history.save();
    }
  });

  // when user decline the call
  socket.on('callCancel', async (data) => {
    console.log('callCancel emit data ===================', data);
    const room = 'globalRoom:' + data?.recieverId;
    console.log('room', room);
    if (room) {
      if (data.callId) {
        console.log('CALL CANCEL callId EXIST  ====');
        const history = await History.findById(data?.callId);
        if (history) {
          let host;
          if (history?.hostId != null) {
            host = await Host.findById(history?.hostId);
          } else {
            host = await User.findById(history?.otherUserId);
          }
          if (host) {
            host.isBusy = false;
            host.recentConnectionId = null;
            await host.save();
            usersRef
              .orderByChild('liveHostId')
              .equalTo(host._id.toString())
              .once('value')
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const keyToUpdate = Object.keys(snapshot.val())[0];
                  const existingData = snapshot.val()[keyToUpdate];
                  const newData = {
                    ...existingData,
                    isBusy: false,
                  };
                  console.log(
                    '==================isBusy update false callCancel ==========',
                    host?.name
                  );
                  return usersRef.child(keyToUpdate).update(newData);
                } else {
                  console.log(
                    'No matching data found in  false callCancel  ===='
                  );
                }
              })
              .then(() => {
                console.log('isBusy field updated successfully callCancel');
              })
              .catch((error) => {
                console.error('Error updating isBusy field callCancel:', error);
              });
          }
          const user = await User.findById(history?.userId);
          if (user) {
            user.isBusy = false;
            user.recentConnectionId = null;
            await user.save();
          }
        }
        io.in(room).emit('callCancel', data);
      } else if (data?.type === 'user') {
        console.log('CALL CANCEL TYPE USER ====');

        const user = await User.findById(data?.callerId);
        if (user?.recentConnectionId) {
          let host;
          const hostData = await Host.findById(data?.recieverId);
          const userData = await User.findById(data?.recieverId);

          if (hostData) {
            host = hostData;
          } else {
            host = userData;
          }
          console.log(
            host?.name,
            user?.name,
            'type ================user ===== both in  call cancle and is busy recentC .. false'
          );
          if (user?.recentConnectionId === host?.recentConnectionId) {
            console.log('connectionId same');
            if (host) {
              host.isBusy = false;
              host.recentConnectionId = null;
              await host.save();
<<<<<<< HEAD
              usersRef
                .orderByChild('liveHostId')
                .equalTo(host._id.toString())
                .once('value')
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    const keyToUpdate = Object.keys(snapshot.val())[0];
                    const existingData = snapshot.val()[keyToUpdate];
                    const newData = {
                      ...existingData,
                      isBusy: false,
                    };
                    console.log(
                      '==================isBusy update false  callCancel==========',
                      host?.name
                    );
                    return usersRef.child(keyToUpdate).update(newData);
                  } else {
                    console.log(
                      'No matching data found in  false  callCancel===='
                    );
                  }
                })
                .then(() => {
                  console.log('isBusy field updated successfully callCancel');
                })
                .catch((error) => {
                  console.error(
                    'Error updating isBusy field callCancel:',
                    error
                  );
                });
=======
>>>>>>> d1e06f04616e32d61d05dc914cd97d9814c2be40
            }
            io.in(room).emit('callCancel', data);
          }
          if (user) {
            user.isBusy = false;
            user.recentConnectionId = null;
            await user.save();
          }
        } else {
          setTimeout(async () => {
            // setTimeOut add because callCancel listen before call is in Process and in process func again isBusy = true ...
            console.log(
              'SET TIMEOUT in callcancel TYPE : user ================'
            );
            const user = await User.findById(data?.callerId);
            let host;
            const hostData = await Host.findById(data?.recieverId);
            const userData = await User.findById(data?.recieverId);
            if (hostData) {
              host = hostData;
            } else {
              host = userData;
            }
            console.log(
              host?.name,
              user?.name,
              'type ================user ===== both in  call cancle and is busy recentC .. false'
            );
            if (user?.recentConnectionId === host?.recentConnectionId) {
              console.log('connectionId same');
              if (host) {
                host.isBusy = false;
                host.recentConnectionId = null;
                await host.save();
              }
              io.in(room).emit('callCancel', data);
            }
            if (user) {
              user.isBusy = false;
              user.recentConnectionId = null;
              await user.save();
            }
          }, 1500);
        }
      } else if (data?.type === 'host') {
        console.log('CALL CANCEL TYPE HOST ====');
        let host = await Host.findById(data?.callerId);
        let user = await User.findById(data?.recieverId);
        console.log(
          host?.name,
          user?.name,
          'type ================user ===== both in  call cancle and is busy recentC .. false'
        );
<<<<<<< HEAD
        if (host) {
          usersRef
            .orderByChild('liveHostId')
            .equalTo(host._id.toString())
            .once('value')
            .then((snapshot) => {
              if (snapshot.exists()) {
                const keyToUpdate = Object.keys(snapshot.val())[0];
                const existingData = snapshot.val()[keyToUpdate];
                const newData = {
                  ...existingData,
                  isBusy: false,
                };
                console.log(
                  '==================isBusy update false callCancel==========',
                  host?.name
                );
                return usersRef.child(keyToUpdate).update(newData);
              } else {
                console.log('No matching data found in  false callCancel====');
              }
            })
            .then(() => {
              console.log('isBusy field updated successfully callCancel');
            })
            .catch((error) => {
              console.error('Error updating isBusy field callCancel:', error);
            });
        }

=======
>>>>>>> d1e06f04616e32d61d05dc914cd97d9814c2be40
        if (host?.recentConnectionId) {
          if (host?.recentConnectionId == user?.recentConnectionId) {
            console.log('connectionId same');
            if (user) {
              user.isBusy = false;
              user.recentConnectionId = null;
              await user.save();
            }
            io.in(room).emit('callCancel', data);
          }
          if (host) {
            host.isBusy = false;
            host.recentConnectionId = null;
            await host.save();
          }
        } else {
          setTimeout(async () => {
            let host = await Host.findById(data?.callerId);
            let user = await User.findById(data?.recieverId);
            console.log(
              'SET TIMEOUT in callcancel TYPE : host ================'
            );
            if (host?.recentConnectionId == user?.recentConnectionId) {
              console.log('connectionId same');
              if (user) {
                user.isBusy = false;
                user.recentConnectionId = null;
                await user.save();
              }
              io.in(room).emit('callCancel', data);
            }
            if (host) {
              host.isBusy = false;
              host.recentConnectionId = null;
              await host.save();
            }
          }, 1500);
        }
      }
    }
  });

  // when user decline the call
  socket.on('manualDisconnect', async (data) => {
    console.log('manualDisconnect EVENT LISTEN  ================', data);

    if (data?.isLive) {
      const liveUser = await LiveUser.findOne({ liveHostId: data?.hostId });
      if (liveUser) {
        const liveStreamingHistory = await LiveStreamingHistory.findById(
          liveUser.channel
        );
        console.log('liveStreamingHistory ', liveStreamingHistory);
        io.in(liveUser.channel).emit(
          'endLiveHost',
          liveStreamingHistory ? liveStreamingHistory?.duration : 0,
          liveUser ? liveUser?.view : 0
        );
        io.socketsLeave(liveUser.channel);
        usersRef
          .orderByChild('liveHostId')
          .equalTo(id)
          .once('value')
          .then((snapshot) => {
            if (snapshot.exists()) {
              const keyToRemove = Object.keys(snapshot.val())[0];
              return usersRef.child(keyToRemove).remove();
            } else {
              console.log('No matching data found');
            }
          })
          .then(() => {
            console.log('Data removed successfully in Manual Disconnect');
          })
          .catch((error) => {
            console.error('Error removing data in Manual Disconnect', error);
          });
        if (!liveStreamingHistory.endTime) {
          liveStreamingHistory.endTime = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
          });
          liveStreamingHistory.duration =
            liveStreamingHistory.duration > 0
              ? liveStreamingHistory.midTime
                ? liveStreamingHistory.duration +
                  moment.utc(
                    moment(new Date(liveStreamingHistory.endTime)).diff(
                      moment(new Date(liveStreamingHistory.midTime))
                    )
                  ) /
                    1000
                : liveStreamingHistory.duration
              : liveStreamingHistory.startTime
              ? moment.utc(
                  moment(new Date(liveStreamingHistory.endTime)).diff(
                    moment(new Date(liveStreamingHistory.startTime))
                  )
                ) / 1000
              : 0;
          await liveStreamingHistory.save();
        }
        await LiveView.deleteMany({
          liveStreamingId: liveUser.channel,
        });
        await liveUser.deleteOne();
      }

      const host = await Host.findById(data?.hostId);
      host.isLive = false;
      await host.save();
    } else {
      if (data?.type == 'user') {
        await CallMatchUser.deleteOne({ userId: id });
        const user = await User.findById(data?.userId);
        if (user) {
          let history;
          let connectedHost;
          if (user?.recentConnectionId) {
            history = await History.findById(user.recentConnectionId);
            if (!history || history?.hostId != null) {
              connectedHost = await Host.findOne({
                recentConnectionId: user?.recentConnectionId,
              });
            } else {
              connectedHost = await User.findOne({
                _id: { $ne: user._id },
                recentConnectionId: user?.recentConnectionId,
              });
            }
          }

          if (history) {
            const abc = io.sockets.adapter.rooms.get(history._id.toString());
            const socketLength = await io
              .in(history?._id.toString())
              .fetchSockets();
            console.log(
              'history exist in manual Disconnect  =====',
              abc,
              socketLength?.length
            );
            io.in(history?._id.toString()).emit(
              'zegoDisconnect',
              history?._id.toString()
            );
            console.log(
              '********************************* manualDisconnect   FIRED USER***********************************************',
              history?._id.toString()
            );

            io.socketsLeave(history?._id.toString());
          }

          if (connectedHost) {
            console.log('connectedUser', user?.recentConnectionId);
            console.log(
              'callDisconnect emit ........... manual disconnect .............................room ',
              user?.recentConnectionId
            );

            socket
              .in(user?.recentConnectionId)
              .emit('callDisconnect', user?.recentConnectionId);
            connectedHost.isBusy = false;
            connectedHost.recentConnectionId = null;
            await connectedHost.save();
            usersRef
              .orderByChild('liveHostId')
              .equalTo(connectedHost?._id.toString())
              .once('value')
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const keyToUpdate = Object.keys(snapshot.val())[0];
                  const existingData = snapshot.val()[keyToUpdate];
                  const newData = {
                    ...existingData,
                    isBusy: false,
                  };
                  console.log(
                    '==================isBusy update false ========== in manualDisconnect ',
                    connectedHost?.name
                  );
                  return usersRef.child(keyToUpdate).update(newData);
                } else {
                  console.log(
                    'No matching data found in  false  ==== manualDisconnect'
                  );
                }
              })
              .then(() => {
                console.log('isBusy field updated successfully');
              })
              .catch((error) => {
                console.error('Error updating isBusy field:', error);
              });
          }
          user.isOnline = false;
          user.isBusy = false;
          user.globalState = 0;
          user.recentConnectionId = null;
          await user.save();
        }
      }

      if (data?.type == 'host') {
        const host = await Host.findById(data?.hostId);
        if (host) {
          const connectedUser = await User.findOne({
            recentConnectionId: host?.recentConnectionId,
          });
          const history = await History.findById(host?.recentConnectionId);
          if (history) {
            io.in(history?._id.toString()).emit(
              'zegoDisconnect',
              history?._id.toString()
            );
            console.log(
              '********************************* manualDisconnect   FIRED HOST************************',
              history?._id.toString()
            );

            io.socketsLeave(history?._id.toString());
          }

          if (connectedUser) {
            console.log('connectedUser', host?.recentConnectionId);
            console.log(
              'callDisconnect emit ........... manual disconnect .............................room ',
              host?.recentConnectionId
            );
            socket
              .in(host?.recentConnectionId)
              .emit('callDisconnect', host?.recentConnectionId);
            connectedUser.isBusy = false;
            connectedUser.recentConnectionId = null;
            await connectedUser.save();
          }
          host.isOnline = false;
          // host.isLive = false;
          host.isBusy = false;
          host.globalState = 0;
          host.recentConnectionId = null;
          await host.save();
        }
      }
    }
  });

  // Disconnect Socket
  socket.on('disconnect', async (reason) => {
    console.log(
      ` ========= ==  reason of disconnect is ========= = ====== =====`,
      id,
      reason
    );
    clearInterval(pingInterval);
    clearInterval(pingTimeout);

    if (globalRoom) {
      const socket1 = await io.in(globalRoom).fetchSockets();
      if (socket1?.length == 0) {
        console.log(
          'socket1?.length.............................in DISCONNECT',
          socket1?.length
        );

        let user = await User.findOne({ _id: id });

        if (user) {
          await CallMatchUser.deleteOne({ userId: id });
          let history;
          if (user.recentConnectionId) {
            history = await History.findById(user.recentConnectionId);
          }
          let connectedHost;
          if (history && history?.hostId != null) {
            connectedHost = await Host.findOne({
              recentConnectionId: user.recentConnectionId,
            });
          } else {
            connectedHost = await User.findOne({
              _id: { $ne: user._id },
              recentConnectionId: user.recentConnectionId,
            });
          }

          if (history) {
            io.to(history?._id.toString()).emit(
              'zegoDisconnect',
              history?._id.toString()
            );
            io.socketsLeave(history?._id.toString());

            if (!history.callEndTime && history.callStartTime) {
              const history_ = await History.findOneAndUpdate(
                { _id: history?._id, callEndTime: { $eq: null } },
                {
                  $set: {
                    callEndTime: new Date().toLocaleString('en-US', {
                      timeZone: 'Asia/Kolkata',
                    }),
                  },
                },
                { new: true }
              );

              if (history_) {
                history_.duration = history_.callEndTime
                  ? moment.utc(
                      moment(new Date(history_.callEndTime)).diff(
                        moment(new Date(history_.callStartTime))
                      )
                    ) / 1000
                  : 0;
                await history_.save();
                await hostCoinEarnedHistory(history_?._id);
              }
            }
          }

          if (connectedHost) {
            console.log('connectedUser', user?.recentConnectionId);

            socket
              .in(user?.recentConnectionId)
              .emit('callDisconnect', user?.recentConnectionId);
            connectedHost.isBusy = false;
            connectedHost.recentConnectionId = null;
            await connectedHost.save();
          }
          user.isOnline = false;
          user.isBusy = false;
          user.globalState = 0;
          user.recentConnectionId = null;
          await user.save();
        } else {
          const host = await Host.findOne({ _id: id });

          if (host) {
            const connectedUser = await User.findOne({
              recentConnectionId: host.recentConnectionId,
            });
            const history = await History.findById(host.recentConnectionId);
            if (history) {
              io.to(history?._id.toString()).emit(
                'zegoDisconnect',
                history?._id.toString()
              );
              console.log(
                '********************************************************FIRED HOST***********************************************************'
              );
              io.socketsLeave(history?._id.toString());

              if (!history.callEndTime && history.callStartTime) {
                const history_ = await History.findOneAndUpdate(
                  { _id: history?._id, callEndTime: { $eq: null } },
                  {
                    $set: {
                      callEndTime: new Date().toLocaleString('en-US', {
                        timeZone: 'Asia/Kolkata',
                      }),
                    },
                  },
                  { new: true }
                );

                if (history_) {
                  history_.duration = history_.callEndTime
                    ? moment.utc(
                        moment(new Date(history_.callEndTime)).diff(
                          moment(new Date(history_.callStartTime))
                        )
                      ) / 1000
                    : 0;

                  await history_.save();
                  await hostCoinEarnedHistory(history_?._id);
                }
              }
            }

            if (connectedUser) {
              console.log('connectedUser', host?.recentConnectionId);
              // writeLogMessage(
              //   logFile,
              //   `${host?.recentConnectionId} , data.callId `,
              //   'callDisconnect EMIT .......... ',
              //   'disconnect default >>>>'
              // );
              console.log(
                'callDisconnect emit ...........DISCONNECT default.............................room  ',
                host?.recentConnectionId
              );
              socket
                .in(host?.recentConnectionId)
                .emit('callDisconnect', host?.recentConnectionId);
              connectedUser.isBusy = false;
              connectedUser.recentConnectionId = null;
              await connectedUser.save();
            }
            host.isOnline = false;
            // host.isLive = false;
            host.isBusy = false;
            host.globalState = 0;
            host.recentConnectionId = null;
            await host.save();
          }
          const liveUserExist = await LiveUser.findOne({
            liveHostId: id,
          });
          if (liveUserExist) {
            setTimeout(async () => {
              console.log('IN setTimeOut === ', id);
              const socket = await io.in('globalRoom:' + id).fetchSockets();
              if (socket?.length == 0) {
                console.log('liveUser Delete in setTimeOut');
                usersRef
                  .orderByChild('liveHostId')
                  .equalTo(id)
                  .once('value')
                  .then((snapshot) => {
                    if (snapshot.exists()) {
                      const keyToRemove = Object.keys(snapshot.val())[0];
                      return usersRef.child(keyToRemove).remove();
                    } else {
                      console.log('No matching data found');
                    }
                  })
                  .then(() => {
                    console.log(
                      'Data removed successfully in disconnect setTimeout'
                    );
                  })
                  .catch((error) => {
                    console.error(
                      'Error removing data in disconnect setTimeout',
                      error
                    );
                  });

                const liveStreamingHistory =
                  await LiveStreamingHistory.findById(host.channel);
                if (liveStreamingHistory) {
                  io.in(host.channel).emit(
                    'endLiveHost',
                    liveStreamingHistory ? liveStreamingHistory?.duration : 0,
                    liveUserExist ? liveUserExist?.view : 0
                  );
                  io.socketsLeave(host.channel);
                  if (!liveStreamingHistory.endTime) {
                    liveStreamingHistory.endTime = new Date().toLocaleString(
                      'en-US',
                      {
                        timeZone: 'Asia/Kolkata',
                      }
                    );
                    liveStreamingHistory.duration =
                      liveStreamingHistory.duration > 0
                        ? moment.utc(
                            moment(new Date(liveStreamingHistory.endTime)).diff(
                              moment(new Date(liveStreamingHistory.startTime))
                            )
                          ) / 1000
                        : 0;
                    await liveStreamingHistory.save();
                  }
                }

                host.isLive = false;
                await host.save();

                console.log('IN setTimeOut === host delete  ', host?.name);

                await LiveView.deleteMany({
                  liveStreamingId: liveUserExist.liveStreamingId,
                });
                await liveUserExist.deleteOne();
              }
            }, 5000);
          }
        }
        queue.active(function (err, ids) {
          ids.forEach(function (id_) {
            kue.Job.get(id_, function (err, job) {
              if (
                job.type === 'Pepsi-new-userUserCall' &&
                job.data.userId === id
              ) {
                job.remove(() => {
                  console.log(
                    'Removed active  Pepsi-new-userUserCall when global socket disconnect done'
                  );
                  randomRemove.stop = true;
                });
              }
            });
          });
        });
        queue.inactive(function (err, ids) {
          ids.forEach(function (id_) {
            kue.Job.get(id_, function (err, job) {
              if (
                job.type === 'Pepsi-new-userUserCall' &&
                job.data.userId === id
              ) {
                job.remove(() => {
                  console.log(
                    'Removed inactive Pepsi-new-userUserCall when global socket disconnect done'
                  );
                });
              }
            });
          });
        });
      }
    }

    queue.active(function (err, ids) {
      ids.forEach(function (id_) {
        kue.Job.get(id_, function (err, job) {
          if (
            (job.type === 'Pepsi-call-random' ||
              job.type === 'Pepsi-Call-User-Host-Call') &&
            job.data.userId === id
          ) {
            job.remove(() => {
              console.log('Removed active  when global socket disconnect done');
              randomRemove.stop = true;
            });
          }
        });
      });
    });
    queue.inactive(function (err, ids) {
      ids.forEach(function (id_) {
        kue.Job.get(id_, function (err, job) {
          if (
            (job.type === 'Pepsi-call-random' ||
              job.type === 'Pepsi-Call-User-Host-Call') &&
            job.data.userId === id
          ) {
            job.remove(() => {
              console.log(
                'Removed inactive  when global socket disconnect done'
              );
            });
          }
        });
      });
    });
  });
});

//pepsi user-user-call removeQue change

// socket.on('removeQueue', async (data_) => {
//   console.log('REMOVE QUE LISTEN ============================ : ', data_);
//   const user = await User.findById(id);
//   const finalData = JSON.parse(data_);
//   const indexToRemove = userToUserCallIds.findIndex(
//     (call) => call._id?.toString() === finalData?.userId
//   );
//   if (indexToRemove !== -1) {
//     console.log(
//       'userToUserCallIds index remove que ============================= ',
//       indexToRemove
//     );
//     userToUserCallIds.splice(indexToRemove, 1); //if already caller is exist then remove
//   }

//   const history = await History.findById(user.recentConnectionId);
//   let connectedHost;
//   if (history?.hostId != null) {
//     connectedHost = await Host.findOne({
//       recentConnectionId: user?.recentConnectionId,
//     });
//   } else {
//     connectedHost = await User.findOne({
//       _id: { $ne: user._id },
//       recentConnectionId: user?.recentConnectionId,
//     });
//   }
//   if (connectedHost) {
//     if (history?.isPrivate) {
//       connectedHost.isBusy = true;
//     } else {
//       connectedHost.isBusy = false;
//       connectedHost.recentConnectionId = null;
//     }
//     await connectedHost.save();
//     console.log(
//       'callCancel emit ...........removeQueue............................. connectedHost._id.toString()   ',
//       connectedHost._id.toString()
//     );

//     socket
//       .in('globalRoom:' + connectedHost._id.toString())
//       .emit('callCancel');
//   }
//   if (user) {
//     if (history?.isPrivate) {
//       user.isBusy = true;
//     } else {
//       user.recentConnectionId = null;
//       user.isBusy = false;
//     }
//     await user?.save();
//   }

//   queue.active(async function (err, ids) {
//     console.log('active Ids : ', ids);
//     await new Promise((resolve, reject) => {
//       ids.forEach(function (id) {
//         // console.log("active job : ", id);
//         kue.Job.get(id, function (err, job) {
//           // console.log("active job: ", job.data);
//           if (
//             (job.type === 'new-call-random' ||
//               job.type === 'Pepsi-user-user-call-random') &&
//             job.data.userId === finalData.userId
//           ) {
//             console.log('remove thava aavyu ');
//             job.remove((error) => {
//               if (error) {
//                 console.log('error on remove job ', error);
//                 return;
//               } else {
//                 console.log('Job Remove Successfully......');
//                 queueProcess.stopQueueProcess = true;
//                 console.log(
//                   'Job Remove Successfully......',
//                   queueProcess.stopQueueProcess
//                 );
//               }
//               randomRemove.stop = true;
//             });
//           }
//         });
//       });
//       resolve();
//     });
//   });
//   queue.inactive(async function (err, ids) {
//     console.log('inactive Ids : ', ids);
//     await new Promise((resolve, reject) => {
//       ids.forEach(function (id) {
//         // console.log("inactive job : ", id);
//         kue.Job.get(id, function (err, job) {
//           // console.log("inactive job: ", job.data);
//           if (
//             (job.type === 'new-call-random' ||
//               job.type === 'Pepsi-user-user-call-random') &&
//             job.data.userId === finalData.userId
//           ) {
//             console.log('remove thava aavyu ');
//             job.remove(() => {
//               randomRemove.stop = true;
//             });
//           }
//         });
//       });
//       resolve();
//     });
//   });
//   if (connectedHost && !history?.isPrivate) {
//     console.log(
//       'callCancel emit ...........removeQueue............................. connectedHost._id.toString()   ',
//       connectedHost._id.toString()
//     );
//     socket
//       .in('globalRoom:' + connectedHost._id.toString())
//       .emit('callCancel');
//   }
//   console.log(
//     'removeQueue : host : ',
//     connectedHost?.isBusy,
//     connectedHost?.recentConnectionId
//   );
//   console.log(
//     'removeQueue : user : ',
//     user?.isBusy,
//     user?.recentConnectionId
//   );
// });
