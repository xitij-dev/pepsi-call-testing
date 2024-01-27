const mongoose = require('mongoose');

mongoose.connect(
  // eslint-disable-next-line max-len
  `mongodb+srv://${process?.env?.DBUSERNAME}:${process?.env?.DBPASSWORD}@cluster0.eugnt.mongodb.net/${process?.env?.DBNAME}?authSource=admin&replicaSet=atlas-dh581v-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true`,
  // 'mongodb+srv://hardikxitijinfo:kanudo%40123123@cluster0.ky5bqzs.mongodb.net/pepsi',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  }
);

const db = mongoose.connection;

module.exports = db;
