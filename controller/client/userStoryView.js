const moment = require('moment');
const UserStoryView = require('../../model/userStoryView');
const Story = require('../../model/story');
const User = require('../../model/user');
const VipPlanHistory = require('../../model/vipPlanHistory');
const StoryView = require('../../model/storyView');
const Setting = require('../../model/setting');

exports.getUserStory = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const setting = await Setting.findOne({});
    const user = await User.findById(req?.query?.userId);

    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'user not exists' });
    }

    const viewHistory = await StoryView.findOne({
      userId: req?.query?.userId,
      storyId: req?.query?.storyId,
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
      user.storyView += 1;
    }
    await user.save();
    return res.status(200).send({
      status: true,
      message: 'success!!',
      user,
      isVip,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
// exports.getUserStory = async (req, res) => {
//   try {
//     if (!req?.query?.userId) {
//       return res
//         .status(200)
//         .send({ status: false, message: 'Invalid details' });
//     }

//     const setting = await Setting.findOne({});
//     const user = await User.findById(req?.query?.userId);

//     if (!user) {
//       return res
//         .status(200)
//         .send({ status: false, message: 'user not exists' });
//     }

//     const startOfDay = moment().startOf('day').format();
//     const endOfDay = moment().endOf('day').format();

//     const userStoryView = await UserStoryView.findOne({
//       userId: req?.query?.userId,
//     });

//     const viewHistory = await StoryView.findOne({
//       userId: req?.query?.userId,
//       storyId: req?.query?.storyId,
//     });

//     const sotryDate = moment(userStoryView?.date).format();

//     let isVip;

//     const vipPlan = await VipPlanHistory.findOne({
//       userId: user._id,
//       isActive: true,
//     }).sort({
//       createdAt: -1,
//     });
//     if (vipPlan && vipPlan.expireDate > moment().toISOString()) {
//       isVip = true;
//     } else {
//       isVip = false;
//     }

//     if (userStoryView) {
//       if (userStoryView.story <= setting.freeStoryView) {
//         if (startOfDay < sotryDate && endOfDay > sotryDate) {
//           if (!viewHistory) {
//             userStoryView.story += 1;
//             await userStoryView.save();
//           }
//           return res.status(200).send({
//             status: true,
//             message: 'Success!!',
//             story: userStoryView,
//             isVip,
//           });
//         }
//         if (startOfDay > sotryDate) {
//           if (!viewHistory) {
//             await userStoryView.save();
//             userStoryView.story = 0;
//             await userStoryView.save();
//             userStoryView.story += 1;
//             userStoryView.date = moment().toISOString();
//             await userStoryView.save();
//           }

//           return res.status(200).send({
//             status: true,
//             message: 'success!!',
//             story: userStoryView,
//             isVip,
//           });
//         }
//       }
//       return res.status(200).send({
//         status: true,
//         message: 'success!!',
//         story: userStoryView,
//         isVip,
//       });
//     }
//     const newUserStroyView = new UserStoryView();
//     newUserStroyView.userId = user._id;
//     newUserStroyView.date = moment().toISOString();
//     newUserStroyView.story += 1;
//     await newUserStroyView.save();

//     return res.status(200).send({
//       status: true,
//       message: 'success!!',
//       story: newUserStroyView,
//       isVip,
//     });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .send({ status: false, message: 'Internal server error' });
//   }
// };

// get story viwe for user
exports.getUserStoryView = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    let isVip;

    const user = await User.findById(req?.query?.userId);
    const vipPlan = await VipPlanHistory.findOne({
      userId: req?.query?.userId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
    if (vipPlan && vipPlan.expireDate > moment().toISOString()) {
      isVip = true;
    } else {
      isVip = false;
    }
    return res
      .status(200)
      .send({ status: true, message: 'success!!', user, isVip });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
