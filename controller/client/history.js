/* eslint-disable one-var-declaration-per-line */
/* eslint-disable one-var */
/* eslint-disable prefer-template */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-dupe-keys */
/* eslint-disable camelcase */
/* global io queue */

// Model
// const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
// const FCM = require('fcm-node');
const moment = require('moment');
const { default: mongoose } = require('mongoose');
const dayjs = require('dayjs');
const History = require('../../model/history');
const User = require('../../model/user');
const Host = require('../../model/host');
const Setting = require('../../model/setting');
const LiveUser = require('../../model/liveUser');
const LiveStreamingHistory = require('../../model/liveStreamingHistory');
const Agency = require('../../model/agency');
const Redeem = require('../../model/redeem');
const PrivateCallUserHost = require('../../model/privateCallUserHost');

// FCM node
// const {
//   writeLogMessage,
//   createCustomLogFile,
// } = require('../../util/logFunction');
const { roundNumber } = require('../../util/roundNumber');
const HostSettlementHistory = require('../../model/hostSettlementHistory');

// const logFile = createCustomLogFile();
// var fcm = new FCM(process?.env?.SERVER_KEY);

// Make Call API
// exports.makeCall = async (req, res) => {
//   try {
//     if (
//       !req.query ||
//       !req.query.callerId ||
//       !req.query.receiverId ||
//       !req.query.videoCallType ||
//       !req.query.callType ||
//       !req.query.charge ||
//       !req.query.type
//     ) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'Invalid Details !' });
//     }

//     const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let channel = '';
//     for (let i = 0; i < 8; i += 1) {
//       channel += randomChars.charAt(
//         Math.floor(Math.random() * randomChars.length)
//       );
//     }

//     let userQuery;
//     let hostQuery;

//     if (req.query.videoCallType === 'user') {
//       userQuery = await User.findById(req.query.callerId);
//       hostQuery = await Host.findById(req.query.receiverId);
//     } else if (req.query.videoCallType === 'host') {
//       userQuery = await User.findById(req.query.receiverId);
//       hostQuery = await Host.findById(req.query.callerId);
//     }

//     const user = userQuery;
//     if (!user) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'User does not exists !' });
//     }

//     const host = hostQuery;
//     if (!host) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'host does not exists !' });
//     }

//     if (req.query.videoCallType === 'user') {
//       if (host.isBlock) {
//         return res.status(200).json({
//           status: false,
//           message: 'Receiver Host is Block By Admin',
//         });
//       }

//       if (!host.isOnline) {
//         return res.status(200).json({
//           status: false,
//           message: 'Ops! host is not online.',
//         });
//       }

//       if (host.isBusy) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'host is busy with someone else !' });
//       }
//       if (!host.isApproved) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'host is not approved !' });
//       }

//       if (user.isBusy) {
//         return res.status(200).json({
//           status: false,
//           message: "Oops Something want's wrong! user",
//         });
//       }
//     }

//     if (req.query.videoCallType === 'host') {
//       if (user.isBlock) {
//         return res.status(200).json({
//           status: false,
//           message: 'Receiver User is Block By Admin',
//         });
//       }

//       if (!user.isOnline) {
//         return res.status(200).json({
//           status: false,
//           message: 'Ops! user is not online.',
//         });
//       }

//       if (user.isBusy) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'user is busy with someone else !' });
//       }

//       if (!host.isApproved) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'You are not approved !' });
//       }

//       if (host.isBusy) {
//         return res.status(200).json({
//           status: false,
//           message: "Oops Something want's wrong! host",
//         });
//       }
//     }

//     const job = queue
//       .create('Pepsi-Call-User-Host-Call', {
//         callerId: req.query.callerId,
//         receiverId: req.query.receiverId,
//         videoCallType: req.query.videoCallType,
//         callType: req.query.callType,
//         callerImage: req.query.image,
//         callerName: req.query.name,
//         charge: parseInt(req.query.charge),
//         type: req.query.type,
//         token: '',
//         channel,
//       })
//       .removeOnComplete(true)
//       .save(function (err) {
//         if (!err) console.log(job.id);
//       });

//     return res.status(200).json({
//       status: true,
//       message: 'Success!!',
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       error: error.message || 'Internal Server Error !',
//     });
//   }
// };

// exports.userHostCall = async (
//   callerId,
//   receiverId,
//   callerImage,
//   callerName,
//   type,
//   videoCallType,
//   coin,
//   callType,
//   token,
//   channel,
//   id,
//   done
// ) => {
//   try {
//     console.log('userHostCall function calling ......');
//     let userQuery, hostQuery;

//     if (videoCallType === 'user') {
//       userQuery = await User.findById(callerId);
//       hostQuery = await Host.findById(receiverId);
//       if (hostQuery.recentConnectionId || userQuery.recentConnectionId) {
//         console.log(
//           'Receiver User connected with someone else .............',
//           userQuery.recentConnectionId,
//           'host',
//           hostQuery.recentConnectionId
//         );
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit(
//             'callRequest',
//             null,
//             'Receiver User connected with someone else'
//           );
//         done();
//         return;
//       }
//       if (userQuery.recentConnectionId) {
//         console.log(
//           ' caller is connected with someone else ....................'
//         );
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit('callRequest', null, 'Oops , something went wrong !!');
//         done();
//         return;
//       }
//     } else if (videoCallType === 'host') {
//       userQuery = await User.findById(receiverId);
//       hostQuery = await Host.findById(callerId);
//       if (userQuery.recentConnectionId || hostQuery.recentConnectionId) {
//         console.log(
//           'Receiver User connected with someone else ..............',
//           userQuery.recentConnectionId,
//           'host',
//           hostQuery.recentConnectionId
//         );

//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit(
//             'callRequest',
//             null,
//             'Receiver User connected with someone else'
//           );
//         done();
//         return;
//       }
//       if (hostQuery.recentConnectionId) {
//         console.log(
//           ' caller is connected with someone else ....................'
//         );
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit('callRequest', null, 'Oops , something went wrong !!');
//         done();
//         return;
//       }
//     }
//     const user = userQuery;

//     const host = hostQuery;

//     host.isBusy = false;
//     if (!host.isBusy) {
//       const outgoing = new History();
//       outgoing.userId = user._id; // call user id
//       outgoing.type = 3;
//       outgoing.hostId = host._id; // call receiver host id
//       outgoing.date = new Date().toLocaleString('en-US', {
//         timeZone: 'Asia/Kolkata',
//       });
//       outgoing.caller = videoCallType;
//       outgoing.isPrivate = true;
//       await outgoing.save();

//       user.isBusy = true;
//       user.recentConnectionId = outgoing._id.toString();
//       await user.save();

//       host.isBusy = true;
//       host.recentConnectionId = outgoing._id.toString();
//       await host.save();

//       const videoCall = {
//         callId: outgoing._id,
//         token,
//         callerId,
//         receiverId,
//         receiverName: videoCallType === 'host' ? user.name : host.name,
//         callerImage,
//         callerName,
//         live: host.isLive,
//         type: videoCallType,
//         coin,
//         callType,
//         channel,
//         jobId: id,
//       };

//       const room = 'globalRoom:' + receiverId;

//       console.log(
//         '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& ---- privateCall startd between user and hot',
//         userQuery.recentConnectionId,
//         hostQuery.recentConnectionId
//       );
//       if (videoCallType === 'host' ? user.isOnline : host.isOnline) {
//         console.log('call request ..................');
//         // writeLogMessage(
//         //   logFile,
//         //   `private call  emit callRequest in host id ====>>>>>>>>>>>>>>> ======>>>>>>>>>>>>>  ${room} with ` +
//         //     JSON.stringify(videoCall),
//         //   'Host',
//         //   'Private Call Success'
//         // );
//         io.sockets.in(room).emit('callRequest', videoCall, null);
//         console.log(
//           `private call  emit callRequest in host id ====>>>>>>>>>>>>>>> ======>>>>>>>>>>>>>  ${room} with ` +
//             JSON.stringify(videoCall)
//         );
//       } else {
//         user.isBusy = false;
//         await user.save();
//         host.isBusy = false;
//         await host.save();
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit('callRequest', null, 'Receiver User Not Connected');
//       }
//     } else {
//       done();
//     }
//     done();
//   } catch (error) {
//     done();
//     console.log(error);
//   }
// };

//  ===========================================================
// exports.userHostCall = async (
//   callerId,
//   receiverId,
//   callerImage,
//   callerName,
//   type,
//   videoCallType,
//   coin,
//   callType,
//   token,
//   channel,
//   id,
//   done
// ) => {
//   try {
//     console.log('userHostCall function calling ......');

//     let userQuery, hostQuery;
//     if (videoCallType === 'user') {
//       userQuery = await User.findById(callerId);
//       hostQuery = await Host.findById(receiverId);

//       if (hostQuery.recentConnectionId || userQuery.recentConnectionId) {
//         console.log(
//           'Receiver User connected with someone else .............',
//           userQuery.recentConnectionId,
//           'host',
//           hostQuery.recentConnectionId
//         );

//         done();
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit(
//             'callRequest',
//             null,
//             'Receiver User connected with someone else'
//           );
//         return;
//       }

//       if (userQuery.recentConnectionId) {
//         console.log(
//           ' caller is connected with someone else ....................'
//         );

//         done();
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit('callRequest', null, 'Oops , something went wrong !!');
//         return;
//       }
//     } else if (videoCallType === 'host') {
//       userQuery = await User.findById(receiverId);
//       hostQuery = await Host.findById(callerId);

//       if (userQuery.recentConnectionId || hostQuery.recentConnectionId) {
//         console.log(
//           'Receiver User connected with someone else ..............',
//           userQuery.recentConnectionId,
//           'host',
//           hostQuery.recentConnectionId
//         );

//         done();
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit(
//             'callRequest',
//             null,
//             'Receiver User connected with someone else'
//           );
//         return;
//       }

//       if (hostQuery.recentConnectionId) {
//         console.log(
//           ' caller is connected with someone else ....................'
//         );

//         done();
//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit('callRequest', null, 'Oops , something went wrong !!');
//         return;
//       }
//     }

//     const user = userQuery;
//     const host = hostQuery;

//     if (!host.isBusy) {
//       const outgoing = new History();
//       outgoing.userId = user._id; // call user id
//       outgoing.type = 3;
//       outgoing.hostId = host._id; // call receiver host id
//       outgoing.date = new Date().toLocaleString('en-US', {
//         timeZone: 'Asia/Kolkata',
//       });
//       outgoing.caller = videoCallType;
//       outgoing.isPrivate = true;
//       await outgoing.save();

//       user.isBusy = true;
//       user.recentConnectionId = outgoing._id.toString();
//       await user.save();

//       host.isBusy = true;
//       host.recentConnectionId = outgoing._id.toString();
//       await host.save();

//       const videoCall = {
//         callId: outgoing._id,
//         token,
//         callerId,
//         receiverId,
//         receiverName: videoCallType === 'host' ? user.name : host.name,
//         callerImage,
//         callerName,
//         live: host.isLive,
//         type: videoCallType,
//         coin,
//         callType,
//         channel,
//         jobId: id,
//       };

//       done();

//       if (videoCallType === 'host' ? user.isOnline : host.isOnline) {
//         console.log('call request ..................');

//         const room = 'globalRoom:' + receiverId;
//         io.sockets.in(room).emit('callRequest', videoCall, null);

//         console.log(
//           `private call  emit callRequest in host id ====>>>>>>>>>>>>>>> ======>>>>>>>>>>>>>  ${room} with ` +
//             JSON.stringify(videoCall)
//         );
//       } else {
//         user.isBusy = false;
//         await user.save();

//         host.isBusy = false;
//         await host.save();

//         io.sockets
//           .in('globalRoom:' + callerId)
//           .emit('callRequest', null, 'Receiver User Not Connected');
//       }
//     } else {
//       done();
//     }
//   } catch (error) {
//     done();
//     console.log(error);
//   }
// };

// exports.makeCall = async (req, res) => {
//   try {
//     if (
//       !req.query ||
//       !req.query.callerId ||
//       !req.query.receiverId ||
//       !req.query.videoCallType ||
//       !req.query.callType ||
//       !req.query.charge ||
//       !req.query.type
//     ) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'Invalid Details !' });
//     }

//     const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let channel = '';
//     for (let i = 0; i < 8; i += 1) {
//       channel += randomChars.charAt(
//         Math.floor(Math.random() * randomChars.length)
//       );
//     }

//     let userQuery;
//     let hostQuery;

//     if (req.query.videoCallType === 'user') {
//       userQuery = await User.findById(req.query.callerId);
//       hostQuery = await Host.findById(req.query.receiverId);
//     } else if (req.query.videoCallType === 'host') {
//       userQuery = await User.findById(req.query.receiverId);
//       hostQuery = await Host.findById(req.query.callerId);
//     }

//     const user = userQuery;
//     if (!user) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'User does not exists !' });
//     }

//     const host = hostQuery;
//     if (!host) {
//       return res
//         .status(200)
//         .json({ status: false, message: 'host does not exists !' });
//     }

//     if (req.query.videoCallType === 'user') {
//       if (host.isBlock) {
//         return res.status(200).json({
//           status: false,
//           message: 'Receiver Host is Block By Admin',
//         });
//       }

//       if (!host.isOnline) {
//         return res.status(200).json({
//           status: false,
//           message: 'Ops! host is not online.',
//         });
//       }

//       if (host.isBusy) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'host is busy with someone else !' });
//       }
//       if (!host.isApproved) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'host is not approved !' });
//       }

//       if (user.isBusy) {
//         return res.status(200).json({
//           status: false,
//           message: "Oops Something want's wrong! user",
//         });
//       }
//     }

//     if (req.query.videoCallType === 'host') {
//       if (user.isBlock) {
//         return res.status(200).json({
//           status: false,
//           message: 'Receiver User is Block By Admin',
//         });
//       }

//       if (!user.isOnline) {
//         return res.status(200).json({
//           status: false,
//           message: 'Ops! user is not online.',
//         });
//       }

//       if (user.isBusy) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'user is busy with someone else !' });
//       }

//       if (!host.isApproved) {
//         return res
//           .status(200)
//           .json({ status: false, message: 'You are not approved !' });
//       }

//       if (host.isBusy) {
//         return res.status(200).json({
//           status: false,
//           message: "Oops Something want's wrong! host",
//         });
//       }
//     }

//     const job = queue
//       .create('Pepsi-Call-User-Host-Call', {
//         callerId: req.query.callerId,
//         receiverId: req.query.receiverId,
//         videoCallType: req.query.videoCallType,
//         callType: req.query.callType,
//         callerImage: req.query.image,
//         callerName: req.query.name,
//         charge: parseInt(req.query.charge),
//         type: req.query.type,
//         token: '',
//         channel,
//       })
//       .removeOnComplete(true)
//       .save(function (err) {
//         if (!err) console.log(job.id);
//       });

//     return res.status(200).json({
//       status: true,
//       message: 'Success',
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       error: error.message || 'Internal Server Error !',
//     });
//   }
// };

exports.userHostCall = async (
  callerId,
  receiverId,
  callerImage,
  callerName,
  type,
  videoCallType,
  coin,
  callType,
  token,
  channel,
  uniqueValue, //caller uniqueValue
  id,
  done
) => {
  try {
    console.log('userHostCall function calling ......');

    let userQuery, hostQuery;
    if (videoCallType === 'user') {
      userQuery = await User.findById(callerId);
      hostQuery = await Host.findById(receiverId);

      if (hostQuery?.isBusy || hostQuery.recentConnectionId) {
        console.log(
          'Receiver Host connected with someone else .............',
          userQuery.recentConnectionId,
          'host',
          hostQuery.recentConnectionId
        );
        if (userQuery.uniqueValue == uniqueValue) {
          console.log('que DONE ==');
          userQuery.uniqueValue = null;
          userQuery.isBusy = false;
          await userQuery.save();
        }
        done();
        io.sockets
          .in('globalRoom:' + callerId)
          .emit(
            'callRequest',
            null,
            'Receiver Host connected with someone else'
          );
        return;
      }

      if (userQuery.recentConnectionId) {
        console.log(
          ' caller is connected with someone else ....................'
        );

        done();
        io.sockets
          .in('globalRoom:' + callerId)
          .emit('callRequest', null, 'Oops , something went wrong !!');
        return;
      }

      console.log("videoCallType === 'user' =============================");

      const user = await User.findById(userQuery?._id);
      console.log(
        'caller user ================',
        user?.name,
        user?.uniqueValue
      );

      const host = await Host.findById(hostQuery?._id);
      console.log(
        'receiver host ================',
        host?.name,
        host?.uniqueValue
      );

      const outgoing = new History();
      outgoing.type = 3;
      outgoing.userId = user._id; //caller
      outgoing.hostId = host._id; //receiver
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      outgoing.caller = videoCallType;
      outgoing.isPrivate = true;

      const videoCall = {
        callId: outgoing._id,
        token,
        callerId,
        receiverId,
        receiverName: videoCallType === 'host' ? user.name : host.name,
        callerImage,
        callerName,
        live: host.isLive,
        type: videoCallType,
        coin,
        callType,
        channel,
        uniqueValue,
        jobId: id,
      };

      const privateCallUserHostDelete = await PrivateCallUserHost.deleteOne({
        userId: user?._id,
        isUser: true,
        type: 'user',
      });

      if (privateCallUserHostDelete?.deletedCount > 0) {
        console.log(
          'privateCallUserHostDelete?.deletedCount > 0 User =========================='
        );

        const hostVerify = await Host.findOne({
          _id: host._id,
          isOnline: true,
          isBusy: false,
        });

        console.log(
          'when type user receiver host name ===================',
          hostVerify.name
        );

        if (hostVerify) {
          console.log('hostVerify ========================');

          await outgoing.save();

          hostVerify.isBusy = true;
          hostVerify.recentConnectionId = outgoing._id.toString();
          hostVerify.uniqueValue = uniqueValue; //same as caller uniqueValue
          await hostVerify.save();

          user.isBusy = true;
          user.recentConnectionId = outgoing._id.toString();
          user.uniqueValue = uniqueValue; //caller uniqueValue
          await user.save();

          done();
          io.sockets
            .in('globalRoom:' + receiverId)
            .emit('callRequest', videoCall, null);
        } else {
          console.log('else hostVerify  ========================');

          done();
          io.sockets
            .in('globalRoom:' + callerId)
            .emit('callRequest', null, 'Receiver User Not Connected.');
        }
      } else {
        done();
        if (!user.recentConnectionId) {
          user.isBusy = false;
          user.uniqueValue = null;
          await user.save();

          console.log(
            'user updated isBusy in else if !user.recentConnectionId ==============================',
            user.isBusy,
            user.uniqueValue
          );
        }
      }
    } else if (videoCallType === 'host') {
      userQuery = await User.findById(receiverId);
      hostQuery = await Host.findById(callerId);

      if (userQuery.isBusy || userQuery.recentConnectionId) {
        console.log(
          'Receiver User connected with someone else ..............',
          userQuery.recentConnectionId,
          'host',
          hostQuery.recentConnectionId
        );
        if (hostQuery.uniqueValue == uniqueValue) {
          console.log('que DONE ==');
          hostQuery.uniqueValue = null;
          hostQuery.isBusy = false;
          await hostQuery.save();
        }
        done();
        io.sockets
          .in('globalRoom:' + callerId)
          .emit(
            'callRequest',
            null,
            'Receiver User connected with someone else'
          );
        return;
      }

      if (hostQuery.recentConnectionId) {
        console.log(
          ' caller is connected with someone else ....................'
        );

        done();
        io.sockets
          .in('globalRoom:' + callerId)
          .emit('callRequest', null, 'Oops , something went wrong !!');
        return;
      }

      console.log("videoCallType === 'host' =============================");

      const user = await User.findById(userQuery?._id);
      console.log(
        'receiver user ================',
        user?.name,
        user?.uniqueValue
      );

      const host = await Host.findById(hostQuery?._id);
      console.log(
        'caller host ================',
        host?.name,
        host?.uniqueValue
      );

      const outgoing = new History();
      outgoing.type = 3;
      outgoing.userId = user._id; //receiver
      outgoing.hostId = host._id; //caller
      outgoing.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });
      outgoing.caller = videoCallType;
      outgoing.isPrivate = true;

      const videoCall = {
        callId: outgoing._id,
        token,
        callerId,
        receiverId,
        receiverName: videoCallType === 'host' ? user.name : host.name,
        callerImage,
        callerName,
        live: host.isLive,
        type: videoCallType,
        coin,
        callType,
        channel,
        jobId: id,
      };

      const privateCallUserHostDelete = await PrivateCallUserHost.deleteOne({
        hostId: host?._id,
        isUser: false,
        type: 'host',
      });
      console.log('privateCallUserHostDelete > 0 ', privateCallUserHostDelete);

      if (privateCallUserHostDelete?.deletedCount > 0) {
        console.log(
          'privateCallUserHostDelete?.deletedCount > 0 Host =========================='
        );

        const userVerify = await User.findOne({
          _id: user._id,
          isOnline: true,
          isBusy: false,
        });

        console.log(
          'when type host receiver user name ===================',
          userVerify.name
        );

        if (userVerify) {
          console.log('userVerify  ========================');

          await outgoing.save();

          userVerify.isBusy = true;
          userVerify.recentConnectionId = outgoing._id.toString();
          userVerify.uniqueValue = uniqueValue; //same as caller uniqueValue
          await userVerify.save();

          host.isBusy = true;
          host.recentConnectionId = outgoing._id.toString();
          host.uniqueValue = uniqueValue; //caller uniqueValue
          await host.save();

          done();
          io.sockets
            .in('globalRoom:' + receiverId)
            .emit('callRequest', videoCall, null);
        } else {
          console.log('else userVerify  ========================');

          done();
          io.sockets
            .in('globalRoom:' + callerId)
            .emit('callRequest', null, 'Receiver User Not Connected.');
        }
      } else {
        done();

        if (!host.recentConnectionId) {
          host.isBusy = false;
          host.uniqueValue = null;
          await host.save();

          console.log(
            'host updated isBusy in else if !host.recentConnectionId ==============================',
            host.isBusy,
            host.uniqueValue
          );
        }
      }
    }

    console.log(
      'type is not valid ================================================================='
    );
  } catch (error) {
    done();
    console.log(error);
  }
};

exports.makeCall = async (req, res) => {
  try {
    if (
      !req.query ||
      !req.query.callerId ||
      !req.query.receiverId ||
      !req.query.videoCallType ||
      !req.query.callType ||
      !req.query.charge ||
      !req.query.type ||
      !req.query.uniqueValue
    ) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details !' });
    }

    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let channel = '';
    for (let i = 0; i < 8; i += 1) {
      channel += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }

    let userQuery;
    let hostQuery;

    if (req.query.videoCallType === 'user') {
      userQuery = await User.findById(req.query.callerId);
      hostQuery = await Host.findById(req.query.receiverId);
    } else if (req.query.videoCallType === 'host') {
      userQuery = await User.findById(req.query.receiverId);
      hostQuery = await Host.findById(req.query.callerId);
    }

    const user = userQuery;
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not exists !' });
    }

    const host = hostQuery;
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'host does not exists !' });
    }

    if (req.query.videoCallType === 'user') {
      console.log(
        "videoCallType === 'user' in makeCall API ========================"
      );

      if (host.isBlock) {
        return res.status(200).json({
          status: false,
          message: 'Receiver Host is Block By Admin',
        });
      }

      if (!host.isOnline) {
        return res.status(200).json({
          status: false,
          message: 'Ops! host is not online.',
        });
      }

      if (host.isBusy) {
        console.log(
          'host.isBusy return in makeCall API return ==================================='
        );

        return res
          .status(200)
          .json({ status: false, message: 'host is busy with someone else !' });
      }

      if (!host.isApproved) {
        return res
          .status(200)
          .json({ status: false, message: 'host is not approved !' });
      }

      if (user.isBusy) {
        return res.status(200).json({
          status: false,
          message: "Oops Something want's wrong! user",
        });
      }

      const userVerify = await User.findOne({ _id: user?._id, isBusy: false });
      if (userVerify) {
        userVerify.isBusy = true;
        userVerify.uniqueValue = req.query.uniqueValue;
        await userVerify.save();

        console.log(
          'userVerify updated ==========================',
          userVerify.isBusy,
          userVerify.uniqueValue
        );
      } else {
        console.log("Oops Something want's wrong! user");

        return res.status(200).json({
          status: false,
          message: "Oops Something want's wrong! user",
        });
      }

      await new PrivateCallUserHost({
        userId: user._id,
        hostId: host._id,
        isUser: req.query.videoCallType == 'user' ? true : false,
        type: req.query.videoCallType,
      }).save();
    }

    if (req.query.videoCallType === 'host') {
      console.log(
        "videoCallType === 'host' in makeCall API ========================"
      );

      if (user.isBlock) {
        return res.status(200).json({
          status: false,
          message: 'Receiver User is Block By Admin',
        });
      }

      if (!user.isOnline) {
        return res.status(200).json({
          status: false,
          message: 'Ops! user is not online.',
        });
      }

      if (user.isBusy) {
        console.log(
          'user.isBusy in callMach privateCall UserHost API ============================================'
        );

        return res
          .status(200)
          .json({ status: false, message: 'user is busy with someone else !' });
      }

      if (!host.isApproved) {
        return res
          .status(200)
          .json({ status: false, message: 'You are not approved !' });
      }

      if (host.isBusy) {
        return res.status(200).json({
          status: false,
          message: "Oops Something want's wrong! host",
        });
      }

      const hostVerify = await Host.findOne({ _id: host?._id, isBusy: false });
      if (hostVerify) {
        hostVerify.isBusy = true;
        hostVerify.uniqueValue = req.query.uniqueValue;
        await hostVerify.save();

        console.log(
          'hostVerify updated ==========================',
          hostVerify.isBusy,
          hostVerify.uniqueValue
        );
      } else {
        console.log('Oops Something went wrong ! host');

        return res.status(200).json({
          status: false,
          message: 'Oops Something went wrong ! host',
        });
      }

      const data = await new PrivateCallUserHost({
        userId: user._id,
        hostId: host._id,
        isUser: req.query.videoCallType == 'user' ? true : false,
        type: req.query.videoCallType,
      }).save();

      console.log('PrivateCallUserHost  =========================', data);
    }

    console.log(
      'QUEUE has been created in callMach privateCall UserHost API ============================================',
      req.query.name
    );

    const job = queue
      .create('Pepsi-Call-User-Host-Call', {
        callerId: req.query.callerId,
        receiverId: req.query.receiverId,
        videoCallType: req.query.videoCallType,
        callType: req.query.callType,
        callerImage: req.query.image,
        callerName: req.query.name,
        charge: parseInt(req.query.charge),
        type: req.query.type,
        token: '',
        channel,
        uniqueValue: req.query.uniqueValue, //caller uniqueValue
      })
      .removeOnComplete(true)
      .save(function (err) {
        if (!err) console.log(job.id);
      });

    return res.status(200).json({
      status: true,
      message: 'Success',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error',
    });
  }
};

// Make Call API for fake host
exports.makeCallForFakeHost = async (req, res) => {
  try {
    if (!req.query || !req.query.callerId) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details !' });
    }

    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let channel = '';
    for (let i = 0; i < 8; i += 1) {
      channel += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }

    const user = await User.findById(req?.query?.callerId);
    if (!user) {
      return res.status(200).json({
        status: false,
        message: 'user not exists',
      });
    }
    if (user.isBusy) {
      return res.status(200).json({
        status: false,
        message: "Oops Something want's wrong! user",
      });
    }

    const host = await Host.find({
      isOnline: true,
      isBusy: false,
      recentConnectionId: null,
      isBlock: false,
      type: 1,
    });

    if (host.length > 0) {
      const job = queue
        .create('Pepsi-Call-User-Host-Call', {
          callerId: req.query.callerId,
          receiverId: host[0]._id,
          videoCallType: 'user',
          callType: 'private',
          callerImage: user.image,
          callerName: user.name,
          charge: parseInt(0),
          type: 'normal',
          token: '',
          channel,
        })
        .removeOnComplete(true)
        .save(function (err) {
          if (!err) console.log(job.id);
        });

      return res.status(200).json({
        status: true,
        message: 'Success!!',
      });
    }
    return res.status(200).json({
      status: false,
      message: 'no one is online',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// History For Admin Panel
exports.historyForUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.type) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details !' });
    }

    const user = await User.findById(req.query.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not Exist!' });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const addFieldQuery_ = {
      shortDate: {
        $toDate: { $arrayElemAt: [{ $split: ['$date', ', '] }, 0] },
      },
    };

    let dateFilterQuery = {};

    if (req.query.startDate !== 'ALL' && req.query.endDate !== 'ALL') {
      sDate = `${req.query.startDate}T00:00:00.000Z`;
      eDate = `${req.query.endDate}T00:00:00.000Z`;

      dateFilterQuery = {
        shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
      };
    }

    if (req.query.type === 'gift') {
      const history = await History.aggregate([
        {
          $match: {
            userId: user._id,
            type: { $in: [8, 9] },
          },
        },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        {
          $lookup: {
            from: 'hosts',
            as: 'host',
            let: { hostId: '$hostId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$hostId', '$_id'],
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
            path: '$host',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            callEndReason: 1,
            uCoin: 1,
            date: 1,
            type: 1,
            hostId: '$host._id',
            hostName: { $ifNull: ['$host.name', null] },
            description: {
              $switch: {
                branches: [
                  { case: { $eq: ['$type', 1] }, then: 'Make Chat' },
                  { case: { $eq: ['$type', 8] }, then: 'Gift In Live' },
                  { case: { $eq: ['$type', 9] }, then: 'Gift In VideoCAll' },
                ],
              },
            },
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, // how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
            ],
            totalCoin: [
              {
                $group: {
                  _id: null,
                  totalCoin: { $sum: '$uCoin' },
                },
              },
            ],
          },
        },
      ]);
      return res.status(200).json({
        status: true,
        message: 'Success!!',
        total:
          history[0]?.pageInfo[0]?.totalRecord > 0
            ? history[0]?.pageInfo[0]?.totalRecord
            : 0,
        totalCoin:
          history[0]?.totalCoin[0]?.totalCoin > 0
            ? history[0]?.totalCoin[0]?.totalCoin
            : 0,
        history: history[0]?.history,
      });
    }
    if (req.query.type === 'referral') {
      const history = await History.aggregate([
        {
          $match: {
            userId: user._id,
            type: 6,
          },
        },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { userId: '$otherUserId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$userId', '$_id'],
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
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            uCoin: 1,
            date: 1,
            type: 1,
            hostId: '$user._id',
            hostName: { $ifNull: ['$user.name', null] },
            description: {
              $switch: {
                branches: [
                  { case: { $eq: ['$type', 6] }, then: 'reffrlebonus' },
                  { case: { $eq: ['$type', 1] }, then: 'Make Chat' },
                ],
              },
            },
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, // how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
            ],
            totalCoin: [
              {
                $group: {
                  _id: null,
                  totalCoin: { $sum: '$uCoin' },
                },
              },
            ],
          },
        },
      ]);
      return res.status(200).json({
        status: true,
        message: 'Success!!',
        total:
          history[0]?.pageInfo[0]?.totalRecord > 0
            ? history[0]?.pageInfo[0]?.totalRecord
            : 0,
        totalCoin:
          history[0]?.totalCoin[0]?.totalCoin > 0
            ? history[0]?.totalCoin[0]?.totalCoin
            : 0,
        history: history[0].history,
      });
    }
    if (req.query.type === 'admin') {
      const history = await History.aggregate([
        {
          $match: {
            userId: user._id,
            type: 5,
          },
        },
        {
          $project: {
            uCoin: 1,
            date: 1,
            caller: 1,
            type: 1,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, // how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
            ],
            totalCoin: [
              {
                $group: {
                  _id: null,
                  totalCoin: { $sum: '$uCoin' },
                },
              },
            ],
          },
        },
      ]);

      return res.status(200).send({
        status: true,
        message: 'success!!',
        total:
          history[0]?.pageInfo[0]?.totalRecord > 0
            ? history[0]?.pageInfo[0]?.totalRecord
            : 0,
        totalCoin:
          history[0]?.totalCoin[0]?.totalCoin > 0
            ? history[0]?.totalCoin[0]?.totalCoin
            : 0,
        history: history[0].history,
      });
    }
    if (req.query.type === 'coinPlan') {
      const history = await History.aggregate([
        {
          $match: {
            userId: user._id,
            type: { $in: [2, 7] },
            planId: { $ne: null },
          },
        },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        { $addFields: { sorting: { $toDate: '$date' } } },
        {
          $sort: { sorting: -1 },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'coinplans',
            localField: 'planId',
            foreignField: '_id',
            as: 'plan',
          },
        },
        {
          $lookup: {
            from: 'falshcoins',
            localField: 'planId',
            foreignField: '_id',
            as: 'flashCoin',
          },
        },

        {
          $addFields: {
            data: {
              $cond: [
                { $eq: [{ $size: '$plan' }, 1] },
                { $arrayElemAt: ['$plan', 0] },
                { $arrayElemAt: ['$flashCoin', 0] },
              ],
            },
          },
        },
        {
          $project: {
            paymentGateway: 1,
            date: 1,
            diamond: 1,
            description: {
              $cond: [{ $eq: ['$type', 2] }, 'coinPlan', 'flashCoin'],
            },
            name: '$user.name',
            dollar: '$data.dollar',
            rupee: '$data.rupee',
            coin: '$data.coin',
            purchaseDate: '$date',
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, // how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
            ],
            totalCoin: [
              {
                $group: {
                  _id: null,
                  totalCoin: { $sum: '$coin' },
                },
              },
            ],
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: 'Success!!',
        total:
          history[0]?.pageInfo[0]?.totalRecord > 0
            ? history[0]?.pageInfo[0]?.totalRecord
            : 0,
        totalCoin:
          history[0]?.totalCoin[0]?.totalCoin > 0
            ? history[0]?.totalCoin[0]?.totalCoin
            : 0,
        history: history[0].history,
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// call history for admin penal
exports.callHistoryForUser = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const addFieldQuery_ = {
      shortDate: {
        $toDate: { $arrayElemAt: [{ $split: ['$date', ', '] }, 0] },
      },
    };

    let dateFilterQuery = {};

    if (req.query.startDate !== 'ALL' && req.query.endDate !== 'ALL') {
      sDate = `${req.query.startDate}T00:00:00.000Z`;
      eDate = `${req.query.endDate}T00:00:00.000Z`;

      dateFilterQuery = {
        shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
      };
    }
    const history = await History.aggregate([
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(userId),
            },
            {
              otherUserId: new mongoose.Types.ObjectId(userId),
            },
          ],
          type: 3,
        },
      },
      {
        $addFields: addFieldQuery_,
      },
      {
        $match: dateFilterQuery,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            hisotry: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$hisotry', '$_id'],
                },
              },
            },
            {
              $lookup: {
                from: 'hosts',
                as: 'host',
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
                      _id: 1,
                      name: 1,
                      image: '$profilePic',
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$host',
              },
            },
            {
              $project: {
                _id: 1,
                callEndReason: 1,
                host: 1,
                coin: '$uCoin',
                // count: 1,
                callConnect: 1,
                callStartTime: 1,
                callEndTime: 1,
                duration: 1,
                callType: {
                  $cond: [{ $eq: ['$caller', 'user'] }, 'Outgoing', 'Incoming'],
                },
                description: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $and: [
                            { $eq: ['$isRandom', true] },
                            { $eq: ['$isPrivate', true] },
                          ],
                        },
                        then: 'Random + Private Call',
                      },
                      {
                        case: { $eq: ['$isRandom', true] },
                        then: 'Random Call',
                      },
                      {
                        case: { $eq: ['$isPrivate', true] },
                        then: 'Private Call',
                      },
                    ],
                    default: 'Missed Call',
                  },
                },
                date: 1,
                createdAt: 1,
              },
            },
          ],
          as: 'hostHistory',
        },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            hisotryId: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$hisotryId', '$_id'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                as: 'otherUserId',
                let: { otheruser: '$otherUserId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$otheruser'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      image: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$otherUserId',
              },
            },
            {
              $lookup: {
                from: 'users',
                as: 'userId',
                let: { userId: '$userId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$userId'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      image: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$userId',
              },
            },
            {
              $project: {
                _id: 1,
                user: 1,
                // callEndReason: 1,
                host: {
                  $cond: [
                    { $eq: ['$otherUserId._id', userId] },
                    '$userId',
                    '$otherUserId',
                  ],
                },
                coin: '$uCoin',
                count: 1,
                callConnect: 1,
                callStartTime: 1,
                callEndTime: 1,
                duration: 1,
                callType: {
                  $cond: [
                    { $ne: ['$otherUserId', null] },
                    'Random',
                    'Incoming',
                  ],
                },
                description: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $and: [
                            { $eq: ['$isRandom', true] },
                            { $eq: ['$isPrivate', true] },
                          ],
                        },
                        then: 'Random + Private Call',
                      },
                      {
                        case: { $eq: ['$isRandom', true] },
                        then: 'Random Call',
                      },
                      {
                        case: { $eq: ['$isPrivate', true] },
                        then: 'Private Call',
                      },
                    ],
                    default: 'Missed Call',
                  },
                },
                date: 1,
                createdAt: 1,
              },
            },
          ],
          as: 'userHistory',
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $cond: [
              { $eq: [1, { $size: '$userHistory' }] },
              { $first: '$userHistory' },
              { $first: '$hostHistory' },
            ],
          },
        },
      },
      {
        $sort: {
          'data.date:': -1,
        },
      },
      {
        $facet: {
          history: [{ $skip: (start - 1) * limit }, { $limit: limit }],
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
          totalCoin: [
            { $group: { _id: null, totalCoin: { $sum: '$data.coin' } } },
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'success',
      total: history[0]?.total[0]?.total || 0,
      totalCoin: history[0]?.totalCoin[0]?.totalCoin || 0,
      history: history[0].history,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// all host history for admin penal
exports.hisotryForHost = async (req, res) => {
  try {
    if (!req?.query?.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req?.query?.hostId);
    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host does not exists' });
    }

    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 20;
    const addFieldQuery_ = {
      shortDate: {
        $toDate: { $arrayElemAt: [{ $split: ['$date', ', '] }, 0] },
      },
    };

    let dateFilterQuery = {};

    if (req.query.startDate !== 'ALL' && req.query.endDate !== 'ALL') {
      sDate = `${req.query.startDate}T00:00:00.000Z`;
      eDate = `${req.query.endDate}T00:00:00.000Z`;

      dateFilterQuery = {
        shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
      };
    }

    let type;
    if (req.query.type === 'call') {
      type = [3];
    } else if (req.query.type === 'gift') {
      type = [8, 9];
    }

    if (req?.query?.type === 'admin') {
      const history = await History.aggregate([
        {
          $match: {
            hostId: host._id,
            type: 5,
          },
        },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        {
          $project: {
            hCoin: 1,
            date: 1,
            caller: 1,
            date: 1,
            type: 1,
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, // how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
            ],
            totalCoin: [
              {
                $group: {
                  _id: null,
                  totalCoin: { $sum: '$hCoin' },
                },
              },
            ],
          },
        },
      ]);

      return res.status(200).send({
        status: true,
        message: 'success!!',
        total:
          history[0].pageInfo.length > 0
            ? history[0].pageInfo[0].totalRecord
            : 0,
        totalCoin:
          history[0].totalCoin.length > 0
            ? history[0].totalCoin[0].totalCoin
            : 0,
        history: history[0].history,
      });
    }
    const history = await History.aggregate([
      {
        $match: {
          hostId: host._id,
          type: { $in: type },
        },
      },
      {
        $addFields: addFieldQuery_,
      },
      {
        $match: dateFilterQuery,
      },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$userId', '$_id'],
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
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          videoCallType: 1,
          callConnect: 1,
          callEndReason: 1,
          hCoin: 1,
          date: 1,
          caller: 1,
          duration: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ['$callConnect', false] },
              'MissedCall',
              {
                $cond: [{ $eq: ['$caller', 'host'] }, 'Outgoing', 'Incoming'],
              },
            ],
          },
          userId: '$user._id',
          userName: { $ifNull: ['$user.name', null] },
          description: {
            $switch: {
              branches: [
                { case: { $eq: ['$type', 0] }, then: 'recevie Gift' },
                {
                  case: {
                    $and: [
                      { $eq: ['$type', 3] },
                      { $eq: ['$isRandom', true] },
                      { $eq: ['$isPrivate', true] },
                    ],
                  },
                  then: 'Random + Private Call',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$type', 3] },
                      { $eq: ['$isRandom', false] },
                      { $eq: ['$isPrivate', false] },
                    ],
                  },
                  then: 'Missed Call',
                },
                {
                  case: {
                    $and: [{ $eq: ['$type', 3] }, { $eq: ['$isRandom', true] }],
                  },
                  then: 'Random Call',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$type', 3] },
                      { $eq: ['$isPrivate', true] },
                    ],
                  },
                  then: 'Private Call',
                },
                { case: { $eq: ['$type', 4] }, then: 'Login Bonus' },
                { case: { $eq: ['$type', 5] }, then: 'By Admin' },
                { case: { $eq: ['$type', 8] }, then: 'Gift In Live' },
                { case: { $eq: ['$type', 9] }, then: 'Gift In videoCAll' },
              ],
            },
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $facet: {
          history: [
            { $skip: (start - 1) * limit }, // how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
          ],
          totalCoin: [
            {
              $group: {
                _id: null,
                totalCoin: { $sum: '$hCoin' },
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      total:
        history[0].pageInfo.length > 0 ? history[0].pageInfo[0].totalRecord : 0,
      totalCoin:
        history[0].totalCoin.length > 0 ? history[0].totalCoin[0].totalCoin : 0,
      history: history[0].history,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// Get Most User Gift History
exports.mostUsedGift = async (req, res) => {
  try {
    const history = await History.aggregate([
      {
        $match: {
          $and: [{ type: 0 }, { giftId: { $ne: null } }],
        },
      },
      {
        $group: {
          _id: '$giftId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'gifts',
          localField: '_id',
          foreignField: '_id',
          as: 'giftId',
        },
      },
      {
        $unwind: {
          path: '$giftId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          giftCoin: '$giftId.coin',
          platFormType: '$giftId.platFormType',
          giftImage: '$giftId.image',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'success',
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// get user coin history [android]
exports.userCoinHistory = async (req, res) => {
  try {
    // 3 1 0 2 9

    if (!req.query.userId) {
      return res.status(200).json({
        status: false,
        message: 'Invalid Details !',
      });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({
        status: false,
        message: 'User not found!',
      });
    }

    const history = await History.aggregate([
      {
        $match: {
          $or: [{ userId: user._id }, { otherUserId: user._id }],
          uCoin: { $ne: 0 },
        },
      },
      { $addFields: { sortDate: { $toDate: '$date' } } },
      { $sort: { sortDate: -1 } },
      {
        $lookup: {
          from: 'users',
          let: { otherUserId: '$otherUserId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$otherUserId'] } } },
            { $project: { _id: 0, uniqueId: 1 } },
          ],
          as: 'otherUserId',
        },
      },
      {
        $lookup: {
          from: 'hosts',
          localField: 'hostId',
          foreignField: '_id',
          as: 'hostId',
        },
      },

      {
        $project: {
          userId: 1,
          uniqueId: {
            $cond: [
              { $eq: [{ $size: '$hostId' }, 1] },
              { $arrayElemAt: ['$hostId.uniqueId', 0] },
              {
                $cond: [
                  { $eq: [{ $size: '$otherUserId' }, 1] },
                  { $arrayElemAt: ['$otherUserId.uniqueId', 0] },
                  '',
                ],
              },
            ],
          },
          coin: { $abs: '$uCoin' },
          isIncome: {
            $cond: [
              {
                $and: [
                  { $in: ['$type', [2, 5, 6, 7, 4]] },
                  { $gte: ['uCoin', 0] },
                ],
              },
              true,
              false,
            ],
          },
          date: 1,
          description: {
            $switch: {
              branches: [
                { case: { $eq: ['$type', 1] }, then: 'Make Chat' },
                { case: { $eq: ['$type', 2] }, then: 'Purchase plan' },
                { case: { $eq: ['$type', 3] }, then: 'Make VideoCall' },
                { case: { $eq: ['$type', 4] }, then: 'Login Bonus' },
                { case: { $eq: ['$type', 5] }, then: 'By Admin' },
                { case: { $eq: ['$type', 6] }, then: 'ReferralCode Bonus' },
                {
                  case: { $eq: ['$type', 7] },
                  then: 'Purchase From ScratchCard',
                },
                { case: { $eq: ['$type', 8] }, then: 'Gift In Live' },
                { case: { $eq: ['$type', 9] }, then: 'Gift In VideoCall' },
                // { case: { $eq: ['$type', 10] }, then: 'Coin Seller' },
              ],
              default: 'default',
            },
          },
        },
      },
      {
        $facet: {
          history: [
            { $skip: req.query.start ? parseInt(req.query.start) : 0 },
            { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'Success',
      history: history.length > 0 ? history[0].history : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// get host coin history [android]
exports.hostCoinHistory = async (req, res) => {
  try {
    // 3 1 0 2 9

    if (!req.query.hostId) {
      return res.status(200).json({
        status: false,
        message: 'Invalid Details !',
      });
    }

    const host = await Host.findById(req.query.hostId);
    if (!host) {
      return res.status(200).json({
        status: false,
        message: 'Host not found!',
      });
    }

    const history = await History.aggregate([
      {
        $match: {
          hostId: host._id,
          hCoin: { $ne: 0 },
        },
      },
      { $addFields: { sortDate: { $toDate: '$date' } } },
      { $sort: { sortDate: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user' } },
      {
        $lookup: {
          from: 'gifts',
          localField: 'giftId',
          foreignField: '_id',
          as: 'gift',
        },
      },
      {
        $project: {
          hostId: 1,
          name: '$user.name',
          coin: { $abs: '$hCoin' },
          image: {
            $cond: [
              { $eq: [{ $size: '$gift' }, 1] },
              { $toString: { $arrayElemAt: ['$gift.image', 0] } },
              '',
            ],
          },
          isIncome: {
            $cond: [
              { $and: [{ $eq: ['$type', 5] }, { $lte: ['$hCoin', 0] }] },
              false,
              true,
            ],
          },
          date: 1,
          description: {
            $switch: {
              branches: [
                { case: { $eq: ['$type', 1] }, then: 'Make Chat' },
                { case: { $eq: ['$type', 2] }, then: 'Purchase plan' },
                { case: { $eq: ['$type', 3] }, then: 'Make VideoCall' },
                { case: { $eq: ['$type', 4] }, then: 'Login Bonus' },
                { case: { $eq: ['$type', 5] }, then: 'By Admin' },
                { case: { $eq: ['$type', 8] }, then: 'Gift In Live' },
                { case: { $eq: ['$type', 9] }, then: 'Gift In VideoCall' },
              ],
            },
          },
        },
      },
      {
        $facet: {
          history: [
            { $skip: req.query.start ? parseInt(req.query.start) : 0 },
            { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'Success',
      history: history.length > 0 ? history[0].history : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// get host settlement  history [android]
exports.hostReedemHistory = async (req, res) => {
  try {
    // 3 1 0 2 9

    if (!req.query.hostId) {
      return res.status(200).json({
        status: false,
        message: 'Invalid Details !',
      });
    }

    const host = await Host.findById(req.query.hostId);
    if (!host) {
      return res.status(200).json({
        status: false,
        message: 'Host not found!',
      });
    }

    // let dateFilterQuery = {};
    // let sDate;
    // let eDate;
    // if (req.query.startDate !== 'ALL' && req.query.endDate !== 'ALL') {
    //   sDate = `${req.query.startDate}T00:00:00.000Z`;
    //   eDate = `${req.query.endDate}T00:00:00.000Z`;

    // for date query

    //   dateFilterQuery = {
    //     analyticDate: {
    //       $gte: new Date(sDate),
    //       $lte: new Date(eDate),
    //     },
    //   };
    // }

    const history = await HostSettlementHistory.aggregate([
      {
        $match: {
          hostId: host._id,
          $or: [{ statusOfTransaction: 1 }, { statusOfTransaction: 2 }],
        },
      },
      {
        $lookup: {
          from: 'hosts',
          localField: 'hostId',
          foreignField: '_id',
          as: 'hostId',
        },
      },
      {
        $unwind: {
          path: '$hostId',
          preserveNullAndEmptyArrays: false,
        },
      },
      { $sort: { startDate: -1 } },
      {
        $addFields: {
          startD: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: { $toDate: '$startDate' },
            },
          },
        },
      },
      {
        $addFields: {
          endD: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: { $toDate: '$endDate' },
            },
          },
        },
      },
      {
        $project: {
          amount: 1,
          hostId: '$hostId.uniqueId',
          startDate: '$startD',
          statusOfTransaction: 1,
          endDate: '$endD',
          note: 1,
        },
      },
      {
        $facet: {
          history: [
            { $skip: req.query.start ? parseInt(req.query.start) : 0 },
            { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'Success',
      history: history.length > 0 ? history[0].history : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

exports.hostHistory = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const historyCount = await History.find({
      type: 3,
      hostId: { $ne: null },
    }).countDocuments();

    const hostHistory = await History.aggregate([
      {
        $match: {
          type: 3,
          hostId: { $ne: null },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: (start - 1) * limit }, // how many records you want to skip
      { $limit: limit },
      {
        $lookup: {
          from: 'hosts',
          as: 'host',
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
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$host',
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userId'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          callEndReason: 1,
          host: 1,
          coin: '$hCoin',

          count: 1,
          callConnect: 1,
          callStartTime: 1,
          callEndTime: 1,
          duration: 1,
          callType: {
            $cond: [
              { $eq: ['$callConnect', false] },
              'MissedCall',
              {
                $cond: [{ $eq: ['$caller', 'host'] }, 'Outgoing', 'Incoming'],
              },
            ],
          },
          type: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ['$isRandom', true] },
                      { $eq: ['$isPrivate', true] },
                    ],
                  },
                  then: 'Random + Private Call',
                },
                { case: { $eq: ['$isRandom', true] }, then: 'Random Call' },
                { case: { $eq: ['$isPrivate', true] }, then: 'Private Call' },
              ],
              default: 'Missed Call',
            },
          },
          date: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: 'success',
      historyCount,
      host: hostHistory,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// get host all call histoery for android
exports.hostCallHistory = async (req, res) => {
  try {
    const historyCount = await History.find({
      type: 3,
      hostId: req.query.hostId,
    }).countDocuments();

    const hostHistory = await History.aggregate([
      {
        $match: {
          type: 3,
          hostId: new mongoose.Types.ObjectId(req.query.hostId),
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userId'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          callEndReason: 1,
          duration: 1,
          callConnect: 1,
          callType: {
            $cond: [{ $eq: ['$caller', 'host'] }, 'Outgoing', 'Incoming'],
          },
          // type: {
          //   $switch: {
          //     branches: [
          //       {
          //         case: {
          //           $and: [
          //             { $eq: ['$isRandom', true] },
          //             { $eq: ['$isPrivate', true] },
          //           ],
          //         },
          //         then: 'Random + Private Call',
          //       },
          //       { case: { $eq: ['$isRandom', true] }, then: 'Random Call' },
          //       { case: { $eq: ['$isPrivate', true] }, then: 'Private Call' },
          //     ],
          //     default: 'Missed Call',
          //   },
          // },
          date: 1,
        },
      },
      { $skip: req.query.start ? parseInt(req.query.start) : 0 }, // how many records you want to skip
      { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
    ]);

    const historyData = await Promise.all(
      hostHistory.map(async (data) => {
        const parsedDate = moment(new Date(data?.date), 'DD/MM/YYYY');
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'day').startOf('day');

        let time;
        if (parsedDate.isSame(today, 'day')) {
          const splitArray = data?.date.split(',');
          time = splitArray[1].trim();
        } else if (parsedDate.isSame(yesterday, 'day')) {
          time = 'yesterday';
        } else {
          // Handle other cases or set a default value
          time = data.date;
        }

        return {
          ...data,
          time,
        };
      })
    );
    return res.status(200).json({
      status: true,
      message: 'success',
      host: hostHistory,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

exports.userCallHistory = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { userId } = req.query;
    const historyCount = await History.find({
      type: 3,
      userId,
    }).countDocuments();

    const hostHistory = await History.aggregate([
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(userId),
            },
            {
              otherUserId: new mongoose.Types.ObjectId(userId),
            },
          ],
          type: 3,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: (start - 1) * limit }, // how many records you want to skip
      { $limit: limit },
      {
        $lookup: {
          from: 'histories',
          let: {
            hisotry: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$hisotry', '$_id'],
                },
              },
            },
            {
              $lookup: {
                from: 'hosts',
                as: 'host',
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
                      _id: 1,
                      name: 1,
                      image: '$profilePic',
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$host',
              },
            },
            {
              $project: {
                _id: 1,
                host: 1,
                duration: 1,
                callType: {
                  $cond: [{ $eq: ['$caller', 'user'] }, 'Outgoing', 'Incoming'],
                },
                date: 1,
                createdAt: 1,
              },
            },
          ],
          as: 'hostHistory',
        },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            hisotryId: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$hisotryId', '$_id'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                as: 'otherUserId',
                let: { otheruser: '$otherUserId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$otheruser'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      image: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$otherUserId',
              },
            },
            {
              $lookup: {
                from: 'users',
                as: 'userId',
                let: { userId: '$userId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$userId'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      image: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$userId',
              },
            },
            {
              $project: {
                _id: 1,
                user: 1,
                host: {
                  $cond: [
                    {
                      $eq: [
                        '$otherUserId._id',
                        new mongoose.Types.ObjectId(userId),
                      ],
                    },
                    '$userId',
                    '$otherUserId',
                  ],
                },
                duration: 1,
                callType: {
                  $cond: [
                    { $ne: ['$otherUserId', null] },
                    'randoom',
                    'Incoming',
                  ],
                },
                date: 1,
                createdAt: 1,
              },
            },
          ],
          as: 'userHistory',
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $cond: [
              { $eq: [1, { $size: '$userHistory' }] },
              { $first: '$userHistory' },
              { $first: '$hostHistory' },
            ],
          },
        },
      },
    ]);
    const historyData = await Promise.all(
      hostHistory.map(async (data) => {
        const parsedDate = moment(new Date(data?.data?.date), 'DD/MM/YYYY');
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'day').startOf('day');

        let time;
        if (parsedDate.isSame(today, 'day')) {
          const splitArray = data?.data?.date.split(',');
          time = splitArray[1].trim();
        } else if (parsedDate.isSame(yesterday, 'day')) {
          time = 'yesterday';
        } else {
          // Handle other cases or set a default value
          time = data?.data?.date;
        }

        return {
          ...data,
          time,
        };
      })
    );
    return res.status(200).json({
      status: true,
      message: 'success',
      historyCount,
      host: historyData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// get all reveive gift by host [anroid]
exports.recevieHostGift = async (req, res) => {
  try {
    if (!req?.query?.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const host = await Host.findById(req?.query?.hostId);
    if (!host) {
      return res
        .status(200)
        .send({ status: false, message: 'host not exists' });
    }

    const history = await History.aggregate([
      {
        $match: {
          hostId: host._id,
          type: { $in: [8, 9] },
          giftId: { $ne: null },
        },
      },
      {
        $lookup: {
          from: 'gifts',
          localField: 'giftId',
          foreignField: '_id',
          as: 'giftId',
        },
      },
      {
        $unwind: {
          path: '$giftId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          gift: '$giftId.image',
          coin: '$hCoin',
        },
      },
      {
        $skip: parseInt(req?.query?.start) || 0,
      },
      {
        $limit: parseInt(req?.query?.limit) || 20,
      },
    ]);

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

// agency history for admin penal
exports.agencyHistoryOfHostWise = async (req, res) => {
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
        .send({ status: false, message: 'agency does not found' });
    }

    const start = parseInt(req?.query?.start) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    const hosts = await Host.find({ agencyId: req?.query?.agencyId }).distinct(
      '_id'
    );
    let searchquery = {};
    if (req?.query?.search != 'ALL') {
      searchquery = {
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$coin' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: '$name',
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
        ],
      };
    }
    let dateFilterQuery = {};
    if (req?.query?.startDate != 'ALL' || req?.query?.endDate != 'ALL') {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        analyticDate: {
          $gt: startDate,
          $lt: endDate,
        },
      };
    }
    const history = await History.aggregate([
      {
        $match: {
          hostId: { $in: hosts },
          hCoin: { $ne: 0 },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $addFields: {
          analyticDate: {
            $toDate: { $arrayElemAt: [{ $split: ['$date', ','] }, 0] },
          },
        },
      },
      {
        $match: dateFilterQuery,
      },
      {
        $lookup: {
          from: 'hosts',
          let: { hostId: '$hostId' },
          as: 'hostId',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$hostId'],
                },
              },
            },
            {
              $lookup: {
                from: 'countries',
                let: { countryId: '$countryId' },
                as: 'countryId',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$countryId'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: '$countryId',
            },
            {
              $project: {
                name: 1,
                country: '$countryId.name',
              },
            },
          ],
        },
      },
      {
        $unwind: '$hostId',
      },
      {
        $project: {
          hostId: 1,
          coin: '$hCoin',
          type: 1,
          giftCoin: {
            $cond: [
              { $or: [{ $eq: ['$type', 8] }, { $eq: ['$type', 9] }] },
              '$hCoin',
              0,
            ],
          },
          callCoin: { $cond: [{ $eq: ['$type', 3] }, '$hCoin', 0] },
          adminCoin: { $cond: [{ $eq: ['$type', 5] }, '$hCoin', 0] },
          date: '$analyticDate',
        },
      },
      {
        $group: {
          _id: {
            hostId: '$hostId._id',
            name: '$hostId.name',
            country: '$hostId.country',
          },
          coin: { $sum: '$coin' },
          adminCoin: { $sum: '$adminCoin' },
          callCoin: { $sum: '$callCoin' },
          giftCoin: { $sum: '$giftCoin' },
        },
      },
      {
        $project: {
          hostId: '$_id.hostId',
          name: '$_id.name',
          country: '$_id.country',
          coin: 1,
          adminCoin: 1,
          callCoin: 1,
          giftCoin: 1,
          _id: 0,
        },
      },
      {
        $match: searchquery,
      },
      {
        $facet: {
          history: [{ $skip: (start - 1) * limit }, { $limit: limit }],
          total: [{ $group: { _id: null, total: { $sum: 1 } } }],
          totalCoin: [{ $group: { _id: null, totalCoin: { $sum: '$coin' } } }],
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      message: 'success!!',
      total: history[0]?.total[0]?.total,
      totalCoin: history[0]?.totalCoin[0]?.totalCoin,
      history: history[0].history,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
const functionA = async (value) => {
  console.log(Date.now());
  const result = await PrivateCallUserHost.updateOne(
    { 'cArray.userId': null },
    { $set: { 'cArray.$.userId': value } }
  );
  console.log('..........', Date.now());
  if (!result?.modifiedCount > 0) {
    console.log('........eeeeeeee..', Date.now());

    try {
      const result = await PrivateCallUserHost.updateOne(
        {},
        {
          $push: {
            cArray: { userId: '222222222', uniqueValue: 'sdvsds' },
          },
        }
      );
      console.log('........eeeeeeee.ssssssss.', Date.now());

      console.log('Document updated successfully:', result);
    } catch (err) {
      console.error('Error updating document:', err);
    }
  } else {
    console.log('.......000...', Date.now());
  }
};

exports.makeCallLoopFunction = async (req, res) => {
  for (let index = 0; index < 2; index++) {
    functionA(` index: ${index}`);
  }
};
// exports.makeCallLoopFunction = aysnc(req,res) => {
//   // for (let index = 0; index < 2; index++) {
//   //   functionA()

//   // }
// };
