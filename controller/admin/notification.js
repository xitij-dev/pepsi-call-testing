/* eslint-disable arrow-parens */
/* eslint-disable no-else-return */
/* eslint-disable import/order */
const User = require('../../model/user');
const Notification = require('../../model/notification');

const FCM = require('fcm-node');
const { default: mongoose } = require('mongoose');
const Agency = require('../../model/agency');
const Host = require('../../model/host');

const fcm = new FCM(process?.env?.SERVER_KEY);

// Send Notification to particular user
exports.particularUserNotification = async (req, res) => {
  try {
    if (!req.params.userId) {
      return res
        .status(200)
        .json({ status: false, message: 'User Id is required !' });
    }

    const user = await User.findById(req.params.userId);

    console.log('reqfile', req?.file);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not exists ! ' });
    }

    const payload = {
      to: user.fcmToken,
      notification: {
        body: req.body.description,
        title: req.body.title,
        image: req.file ? process?.env?.BASE_URL + req.file.path : '',
      },
      data: {
        data: {
          body: req.body.description,
          title: req.body.title,
          image: req.file ? process?.env?.BASE_URL + req.file.path : '',
        },
        // type: 'ADMIN',
      },
    };

    await fcm.send(payload, async function (err, response) {
      if (err) {
        console.log('error in notification', err);
        // console.log("Something has gone wrong!");
        return res.status(200).json({
          status: 200,
          message: 'Error !',
          data: false,
        });
      }
      const notification = new Notification();

      notification.userId = user._id;
      notification.title = req.body.title;
      notification.image = req.file
        ? process?.env?.BASE_URL + req.file.path
        : '';
      notification.message = req.body.description;
      notification.notificationType = 0;
      notification.date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      });

      await notification.save();

      console.log(response);
      return res.status(200).json({
        status: 200,
        message: 'Successfully sent message',
        // data: true,
      });
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// Send Notification to particular user
exports.particularAgencyNotification = async (req, res) => {
  try {
    if (!req.params.agencyId) {
      return res
        .status(200)
        .json({ status: false, message: 'agency Id is required !' });
    }

    const agency = await Agency.findById(req.params.agencyId);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: 'agency does not exists ! ' });
    }

    const payload = {
      to: agency.fcm_token,
      notification: {
        body: req.body.description,
        title: req.body.title,
        image: req.file ? process?.env?.BASE_URL + req.file.path : '',
      },
      data: {
        data: {},
        type: 'ADMIN',
      },
    };

    await fcm.send(payload, async function (err, response) {
      if (err) {
        console.log('error in notification', err);
        // console.log("Something has gone wrong!");
        return res.status(200).json({
          status: 200,
          message: 'Error !',
          data: false,
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'Successfully sent message',
        // data: true,
      });
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error !',
    });
  }
};

// get userwise notification in admin penal
exports.getUserWiseNotification = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const data = await Notification.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req?.query?.userId),
        },
      },
      {
        $project: {
          title: 1,
          message: 1,
          date: 1,
          notificationType: 1,
          image: 1,
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $skip: parseInt(req?.query?.start) || 0,
      },
      {
        $limit: parseInt(req?.query?.limit) || 20,
      },
    ]);
    if (!data) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

    return res
      .status(200)
      .send({ status: true, message: 'success!!', notification: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get host wise notification in admin penal
exports.getHostWiseNotification = async (req, res) => {
  try {
    if (!req?.query?.hostId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const data = await Notification.aggregate([
      {
        $match: {
          hostId: new mongoose.Types.ObjectId(req?.query?.hostId),
        },
      },

      {
        $project: {
          image: 1,
          title: 1,
          message: 1,
          date: 1,
          notificationType: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: parseInt(req?.query?.start) || 0,
      },
      {
        $limit: parseInt(req?.query?.limit) || 20,
      },
    ]);
    if (!data) {
      return res.status(200).send({ status: false, message: 'data not found' });
    }

    return res
      .status(200)
      .send({ status: true, message: 'success!!', notification: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// send notificaiton for admin penal
exports.sendNotification = async (req, res) => {
  try {
    const batchSize = 1000; // maximum number of tokens per batch

    if (req.body.notificationType.trim().toLowerCase() === 'agency') {
      const agency = await Agency.find({ isDisable: false }).distinct(
        'fcm_token'
      );
      // const agency_ = await Agency.find({ isDisable: false });

      for (let i = 0; i < agency.length; i += batchSize) {
        const batchTokens = agency.slice(i, i + batchSize);

        const payload = {
          registration_ids: batchTokens,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: req.file ? process?.env?.BASE_URL + req.file.path : '',
          },
        };

        await fcm.send(payload, function (err, response) {
          if (response) {
            console.log('Successfully sent with response: ', response);
          } else {
            console.log('error in notification', err);
            console.log('Something has gone wrong!');
          }
        });
      }
      return res.status(200).json({
        status: 200,
        message: 'Successfully sent message',
        // data: true,
      });
    } else if (req.body.notificationType.trim().toLowerCase() === 'user') {
      const user = await User.find({ isBlock: false }, { fcmToken: 1 });

      // const user_ = await User.find({ isBlock: false });

      for (let i = 0; i < user.length; i += batchSize) {
        const batchUsers = user.slice(i, i + batchSize);
        const registrationTokens = batchUsers.map((users) => users.fcmToken);

        const payload = {
          registration_ids: registrationTokens,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: req.file ? process?.env?.BASE_URL + req.file.path : '',
          },
          data: {
            data: {
              data: {
                body: req.body.description,
                title: req.body.title,
                image: req.file ? process?.env?.BASE_URL + req.file.path : '',
              },
              // type: 'ADMIN',
            },

            type: 'ADMIN',
          },
        };

        await fcm.send(payload, async function (err, response) {
          if (response) {
            console.log('Successfully sent with response: ', response);
            for (let index = 0; index < batchUsers.length; index += 1) {
              const element = batchUsers[index]._id;
              const notification = new Notification();

              notification.userId = element;
              notification.title = req.body.title;
              notification.image = req.file
                ? process?.env?.BASE_URL + req.file.path
                : '';
              notification.message = req.body.description;
              notification.notificationType = 0;
              notification.date = new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata',
              });

              await notification.save();
            }
          } else {
            console.log('Something has gone wrong!');
            console.log('error in user notification!', err);
          }
        });
      }
      return res.status(200).json({
        status: 200,
        message: 'Successfully sent message',
        // data: true,
      });
    } else if (req.body.notificationType.trim().toLowerCase() === 'host') {
      const host = await Host.find(
        {
          isBlock: false,
          type: 1,
          fcm_token: { $ne: null },
        },
        { fcm_token: 1 }
      );
      // const host_ = await Host.find({ isBlock: false });
      for (let i = 0; i < host.length; i += batchSize) {
        const batchHosts = host.slice(i, i + batchSize);
        const registrationTokens = batchHosts.map((hosts) => hosts.fcm_token);

        const payload = {
          registration_ids: registrationTokens,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: req.file ? process?.env?.BASE_URL + req.file.path : '',
          },
          data: {
            data: {
              body: req.body.description,
              title: req.body.title,
              image: req.file ? process?.env?.BASE_URL + req.file.path : '',
            },
            type: 'ADMIN',
          },
        };

        await fcm.send(payload, async function (err, response) {
          if (response) {
            console.log('Successfully sent with response: ', response);
            for (let index = 0; index < batchHosts.length; index += 1) {
              const element = batchHosts[index]._id;
              const notification = new Notification();

              notification.title = req.body.title;
              notification.hostId = element;
              notification.image = req.file
                ? process?.env?.BASE_URL + req.file.path
                : '';
              notification.message = req.body.description;
              notification.notificationType = 0;
              notification.date = new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata',
              });

              await notification.save();
            }
          } else {
            console.log('Something has gone wrong!');
            console.log('error in user notification!', err);
          }
        });
      }
      return res.status(200).json({
        status: 200,
        message: 'Successfully sent message',
        // data: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};

// send notification for admin penal
exports.SendNotificationToAgencyHost = async (req, res) => {
  try {
    if (!req?.body?.agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const agency = await Agency.findById(req?.body?.agencyId);
    if (!agency) {
      return res
        .status(200)
        .send({ status: false, message: 'Agency Does Not Found !!' });
    }
    const batchSize = 1000; // maximum number of tokens per batch
    const host = await Host.find(
      {
        agencyId: req?.body?.agencyId,
        isBlock: false,
        type: 1,
        fcm_token: { $ne: null },
      },
      { fcm_token: 1 }
    );
    for (let i = 0; i < host.length; i += batchSize) {
      const batchHosts = host.slice(i, i + batchSize);
      const registrationTokens = batchHosts.map((hosts) => hosts.fcm_token);

      const payload = {
        registration_ids: registrationTokens,
        notification: {
          body: req.body?.description,
          title: req.body?.title,
          image: req.file ? process?.env?.BASE_URL + req.file.path : '',
        },
        data: {
          data: {
            body: req.body?.description,
            title: req.body?.title,
            image: req.file ? process?.env?.BASE_URL + req.file.path : '',
          },
          type: 'AGENCY',
        },
      };

      await fcm.send(payload, async function (err, response) {
        if (response) {
          console.log('Successfully sent with response: ', response);
          for (let index = 0; index < batchHosts.length; index += 1) {
            const element = batchHosts[index]._id;
            const notification = new Notification();

            notification.title = req.body?.title;
            notification.hostId = element;
            notification.image = req.file
              ? process?.env?.BASE_URL + req.file.path
              : '';
            notification.message = req.body?.description;
            notification.notificationType = 0;
            notification.date = new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
            });

            await notification.save();
          }
        } else {
          console.log('Something has gone wrong!');
          console.log('error in user notification!', err);
        }
      });
      return res.status(200).json({
        status: 200,
        message: 'Successfully sent message',
        // data: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};
