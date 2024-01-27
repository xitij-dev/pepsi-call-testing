const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const fs = require('fs');
const Agency = require('../../model/agency');

const cryptr = new Cryptr('myTotallySecretKey', {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});
exports.store = async (req, res) => {
  try {
    if (!req.body.name || !req.body.password || !req.body.code) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const Acode = await Agency.find({ code: req.body.code });

    if (Acode.length > 0) {
      return res
        .status(200)
        .send({ status: false, message: ' code is already taken' });
    }
    const agency = new Agency();

    agency.name = req.body.name;
    agency.code = req.body.code;
    agency.password = cryptr.encrypt(req.body.password);
    agency.mobileNo = req.body.mobileNo;
    agency.email = req.body.email;
    agency.countryId = req.body.countryId;
    agency.image = req.file ? process.env.BASE_URL + req.file.path : null;
    await agency.save();

    const data = await Agency.findById({ _id: agency._id }).populate(
      'countryId',
      'name'
    );

    data.password = await cryptr.decrypt(data.password);
    return res
      .status(200)
      .send({ status: true, message: 'success', agency: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.login = async (req, res) => {
  try {
    if (!req.body.code || !req.body.password) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const agency = await Agency.findOne({ code: req.body.code });

    if (!agency) {
      return res.status(200).send({ status: false, message: 'Invalid code' });
    }
    if (agency.isDisable) {
      return res
        .status(200)
        .send({ status: false, message: 'you are not able to login' });
    }

    if (cryptr.decrypt(agency.password) !== req.body.password) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid password' });
    }

    agency.fcm_token = req.body.fcm_token;
    agency.identity = req.body.identity;
    await agency.save();

    const payload = {
      _id: agency._id,
      name: agency.name,
      image: agency.image,
      code: agency.code,
      mobileNo: agency.mobileNo,
    };

    const token = jwt.sign(payload, process.env.JWT_TOKEN);

    return res.status(200).send({ status: true, message: 'success', token });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

// for admin panel
exports.getAgency = async (req, res) => {
  try {
    let searchquery;
    let sort = { createdAt: -1 };
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    if (req.query.search !== 'All') {
      searchquery = {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req?.query?.search, $options: 'i' } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$code' },
                regex: req?.query?.search,
                options: 'i',
              },
            },
          },
        ],
      };
    } else {
      searchquery = { _id: { $ne: null } };
    }

    if (req?.query?.sort === 'currentRevenue') {
      sort = {
        currentRevenue: parseInt(req.query?.sortType) || 1,
      };
    }
    const agency = await Agency.aggregate([
      {
        $match: searchquery,
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'countryId',
        },
      },
      {
        $unwind: {
          path: '$countryId',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'agencysettlementhistories',
          as: 'settlementHistory',
          let: { agencyId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$agencyId', '$$agencyId'] },
              },
            },
            {
              $project: {
                _id: 0,
                amount: 1,
              },
            },
            {
              $sort: {
                _id: -1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $project: {
          code: 1,
          password: 1,
          fcm_token: 1,
          name: 1,
          approveDate: 1,
          email: 1,
          countryId: 1,
          createdAt: 1,
          image: 1,
          isDisable: 1,
          forRandomCall: 1,
          forLiveStreaming: 1,
          mobileNo: 1,
          receiveCoin: 1,
          spendCoin: 1,
          type: 1,
          currentRevenue: {
            $cond: [
              { $eq: [{ $size: '$settlementHistory' }, 1] },
              { $arrayElemAt: ['$settlementHistory.amount', 0] },
              0,
            ],
          },
        },
      },
      { $sort: sort },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    // eslint-disable-next-line no-shadow, array-callback-return
    await agency.map((agency) => {
      agency.password =
        req.query.type === 'admin'
          ? cryptr.decrypt(agency.password)
          : agency.password;
    });

    const total = await Agency.find().countDocuments();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', total, agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all for crate host
exports.getAgencyForCreateHost = async (req, res) => {
  try {
    const agency = await Agency.find({ type: 1 }, { _id: 1, name: 1 });
    return res.status(200).send({ status: true, message: 'success!!', agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.enbleDisebleAgency = async (req, res) => {
  try {
    if (!req.params.agencyId) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const agency = await Agency.findById(req.params.agencyId).populate(
      'countryId',
      'name'
    );

    if (!agency) {
      return res
        .status(200)
        .send({ status: false, message: 'agency not exists' });
    }

    agency.isDisable = !agency.isDisable;

    await agency.save();

    return res
      .status(200)
      .send({ status: true, message: 'successfully update', agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.updateAgency = async (req, res) => {
  try {
    if (!req.params.agencyId) {
      return res
        .status(200)
        .json({ status: false, message: 'Agency Id is required !' });
    }

    const agency = await Agency.findById(req.params.agencyId);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: 'Agency does not found !' });
    }

    if (req.file) {
      if (agency.image) {
        const image = agency.image.split('storage');
        if (image) {
          if (fs.existsSync(`storage${image[1]}`)) {
            fs.unlinkSync(`storage${image[1]}`);
          }
        }
      }
      agency.image = process?.env?.BASE_URL + req.file.path;
    }

    agency.name = req.body.name ? req.body.name : agency.name;
    agency.code = req.body.code ? req.body.code : agency.code;
    agency.mobileNo = req.body.mobileNo ? req.body.mobileNo : agency.mobileNo;
    agency.email = req.body.email ? req.body.email : agency.email;
    agency.countryId = req.body.countryId
      ? req.body.countryId
      : agency.countryId;
    agency.password = req.body.password
      ? cryptr.encrypt(req.body.password)
      : agency.password;

    await agency.save();

    const data = await Agency.findById(agency._id).populate(
      'countryId',
      'name'
    );
    data.password = await cryptr.decrypt(data.password);
    return res.status(200).json({
      status: true,
      message: 'success',
      agency: data,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.updateAgencyPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const agency = await Agency.findById(req.agency._id);
    if (cryptr.decrypt(agency.password) !== req.body.oldPass) {
      return res
        .status(200)
        .send({ status: false, message: 'old password is Invalid' });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: 'password does not match' });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    const agencyPass = await Agency.findOneAndUpdate(
      { _id: agency._id },
      { password: hash },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: 'pssword upadted', agency: agencyPass });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(200).send({ status: false, message: 'id is require' });
    }

    const agency = await Agency.findById(req.params.id).populate(
      'countryId',
      'name'
    );
    if (!agency) {
      return res
        .status(200)
        .send({ status: false, message: 'agency not found' });
    }

    return res.status(200).send({ status: true, message: 'success!!', agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// create fake agency for create fake host
exports.cretaeFakeAgency = async (req, res) => {
  try {
    const fakeAgency = new Agency();

    fakeAgency.name = req?.body?.name ? req?.body?.name : 'fakeHostAgency';
    fakeAgency.code = req?.body?.code ? req?.body?.code : 123401;
    fakeAgency.password = req?.body?.password
      ? cryptr.encrypt(req?.body?.password)
      : cryptr.encrypt(123456);
    fakeAgency.mobileNo = req?.body?.mobileNo
      ? req?.body?.mobileNo
      : 1523468796;
    fakeAgency.email = req?.body?.email ? req?.body?.email : 'fake@gmail.com';
    fakeAgency.countryId = req?.body?.countryId
      ? req?.body?.countryId
      : '647edf4a693e0fdc4a7705ff';
    fakeAgency.image = req?.body?.image
      ? req?.body?.image
      : 'https://unsplash.com/photos/Z9w18_hF1Kk';
    fakeAgency.type = 2;
    await fakeAgency.save();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', fakeAgency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// delete fake agency for create fake host
exports.deleteFakeAgency = async (req, res) => {
  try {
    const fakeAgency = await Agency.findById(req?.params?.agencyId);

    if (!fakeAgency) {
      return res
        .status(200)
        .send({ status: false, message: 'agency not found' });
    }

    await fakeAgency.deleteOne();

    return res.status(200).send({ status: true, message: 'success!!' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
