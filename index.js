/* eslint-disable no-undef */
// Pepsi-App-Call

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.listen();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));
const kue = require('kue');
const http = require('http');
const queueProcess = require('./util/stopQueueProcess');
const db = require('./middleware/conectMongo');
const route = require('./route');
const {
  randomMatchUser,
  randomMatchHost,
} = require('./controller/client/random');
const { userHostCall } = require('./controller/client/history');
const { agencyWiseHostSettlement } = require('./services/agencyWiseSettlement');
const User = require('./model/user');
// const { firebaseConfig } = require('./middleware/fireBase');

app.use('/', route);

app.get('/*', function (req, res) {
  res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

global.queue = kue.createQueue({
  redis: {
    prefix: 'PEPSI-Call',
    db: 12,
  },
});

// Global variable to manage call between user-to-user
global.userToUserCallIds = [];

const server = http.createServer(app);

global.io = require('socket.io')(server, {
  pingTimeout: 20000,
  pingInterval: 25000, // connection stable b/w 25 sec time
  maxHttpBufferSize: 1e8,
});

require('./socket');

app.use('/kue-api', kue.app);

queue.process('Pepsi-call-random', async function (job, done) {
  try {
    console.log('data when random call in process ', job.data);

    kue.Job.rangeByType(
      'Pepsi-call-random',
      'active',
      0,
      -1,
      'desc',
      async function (err, jobs) {
        if (err) {
          console.log('Error:', err);
          return;
        }

        const active = jobs.length;
        console.log('Total active jobs count:', active);

        if (active == 1) {
          setTimeout(async () => {
            console.log('TstopQueueProcess: ', queueProcess.stopQueueProcess);
            if (queueProcess.stopQueueProcess) {
              done();
              queueProcess.stopQueueProcess = false;
              return;
            }
            await randomMatchHost(
              job.data.userId,
              job.data.type,
              job.data.count,
              job.data.uniqueId,
              job.id,
              done
            );
          }, 1500);
        } else {
          await randomMatchHost(
            job.data.userId,
            job.data.type,
            job.data.count,
            job.data.uniqueId,
            job.id,
            done
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

queue.process('Pepsi-user-user-call-random', 2, async function (job, done) {
  try {
    const user = await User.findById(job.data.userId);
    userToUserCallIds.push(user);
    console.log('data when random call in process ', job.data);
    console.log('data  job.data.count === QUE  ', job.data.count);
    console.log(
      'userToUserCallIds in index.js ========= QUE ',
      userToUserCallIds?.length
    );

    await randomMatchUser(
      job.data.userId,
      job.data.type,
      job.data.count,
      job.data.uniqueId,
      job.id,
      done
    );
  } catch (error) {
    console.log(error);
  }
});

// eslint-disable-next-line no-undef
queue.process('Pepsi-Call-User-Host-Call', async (job, done) => {
  try {
    console.log('data when private call in process ', job.data);
    await userHostCall(
      job.data.callerId,
      job.data.receiverId,
      job.data.callerImage,
      job.data.callerName,
      job.data.type,
      job.data.videoCallType,
      job.data.charge,
      job.data.callType,
      job.data.token,
      job.data.channel,
      job.id,
      done
    );
  } catch (error) {
    console.log(error);
  }
});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('MONGO: successfully connected to db');
});

// set node cron for settlement
// cron.schedule('00 00 00 * * 1', async () => {
//   await agencyWiseHostSettlement();
// });

// set node cron for update view
cron.schedule('0 0 * * *', async () => {
  await User.updateMany({ _id: { $ne: null } }, { $set: { storyView: 0 } });
});

// start the server
server.listen(process?.env?.PORT, () => {
  console.log(`Magic happens on port ${process?.env?.PORT}` || 5000);
});
