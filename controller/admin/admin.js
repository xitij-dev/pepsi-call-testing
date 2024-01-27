const jwt = require('jsonwebtoken');
const fs = require('fs');
const Cryptr = require('cryptr');
const Admin = require('../../model/admin');

const cryptr = new Cryptr('myTotallySecretKey', {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});
// create admin
exports.store = async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.file
    ) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid details !' });
    }

    const admin = new Admin();
    admin.name = req.body.name;
    admin.email = req.body.email;
    admin.password = cryptr.encrypt(req.body.password);
    admin.image = req.file.path;
    admin.flag = req.body.flag ? req.body.flag : false;

    await admin.save();
    return res.status(200).json({
      status: true,
      message: 'Admin Created Successful !',
      admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error });
  }
};

// admin login
exports.login = async (req, res, next) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      const admin = await Admin.findOne({ email: req.body.email });

      if (!admin) {
        return res.status(200).send({
          status: false,
          message: "Oops ! Email doesn't exist",
        });
      }

      const isPassword = cryptr.decrypt(admin.password);

      if (req.body.password !== isPassword) {
        return res.status(200).send({
          status: false,
          message: "Oops ! Password doesn't match",
        });
      }

      const payload = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        flag: admin.flag,
        role: admin.role,
        isActive: admin.isActive,
      };

      const token = jwt.sign(payload, process?.env?.JWT_TOKEN);

      if (admin.isActive) {
        return res.status(200).json({
          status: true,
          message: 'Admin Login Successfully !!',
          token,
        });
      }
      return res
        .status(200)
        .json({ status: false, message: 'Admin does not exists !' });
    }
    return res
      .status(200)
      .send({ status: false, message: 'Oops ! Invalid details !' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, error: error.message || 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(200)
        .send({ status: false, message: 'admin not exists' });
    }

    if (req.file) {
      if (fs.existsSync(admin.image)) {
        fs.unlinkSync(admin.image);
      }
      admin.image = req.file.path;
    }

    admin.name = req.body.name ? req.body.name : admin.name;
    admin.email = req.body.email ? req.body.email : admin.email;

    await admin.save();

    return res.status(200).send({ status: true, message: 'success!!', admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(200)
        .send({ status: false, message: 'admin not exists' });
    }

    return res.status(200).send({ status: true, message: 'success!!', admin });
  } catch (error) {
    console.log(error);
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res
        .status(200)
        .send({ status: false, message: 'old password is Invalid' });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: 'password does not match' });
    }

    admin.password = cryptr.encrypt(req.body.newPass);
    await admin.save();
    return res
      .status(200)
      .send({ status: true, message: 'pssword upadted', admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' || error });
  }
};
