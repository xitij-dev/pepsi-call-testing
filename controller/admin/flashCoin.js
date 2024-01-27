const shuffle = require('shuffle-array');
const FlashCoin = require('../../model/flashCoin');

exports.store = async (req, res) => {
  try {
    const { coin, rupee, discount, tag, dollar, productKey } = req.body;

    if (!coin || !rupee || !discount || !tag) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const flashCoin = new FlashCoin();

    flashCoin.coin = coin;
    flashCoin.tag = tag;
    flashCoin.rupee = rupee;
    flashCoin.dollar = dollar;
    flashCoin.productKey = productKey;
    flashCoin.discount = discount;
    flashCoin.image = req.file ? process?.env?.BASE_URL + req.file.path : null;

    const pay = (rupee * discount) / 100;
    flashCoin.rupeeWithDiscount = rupee - Math.floor(pay);

    await flashCoin.save();

    return res
      .status(200)
      .send({ status: true, message: 'success', response: flashCoin });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

// get coinplan for admin penal
exports.getFlashCoin = async (req, res) => {
  try {
    const plan = await FlashCoin.find().sort({ createdAt: -1 });

    return res
      .status(200)
      .send({ status: true, message: 'Success!!', response: plan });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error ' });
  }
};

// get coinplan for android
exports.getPlan = async (req, res) => {
  try {
    const plan = await FlashCoin.find({ isActive: true }).sort({
      createdAt: -1,
    });

    const data = [];
    for (let index = 0; index < plan.length; index += 1) {
      const ele = plan[index];

      const obj = {
        _id: ele._id,
        createdAt: ele.createdAt,
        updatedAt: ele.updatedAt,
        tag: ele.tag,
        coin: ele.coin,
        discount: ele.discount,
        rupee: ele.rupee,
        rupeeWithDiscount: ele.rupeeWithDiscount,
        image: ele.image,
        isActive: ele.isActive,
        dollar: ele.dollar,
        productKey: ele.productKey,
        extraCoin: 0,
        isDelete: false,
        name: '',
        validity: '',
        validityType: '',
      };

      data.push(obj);
    }
    shuffle(data);
    return res.status(200).send({ status: true, message: 'success!!', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.updateFlashCoin = async (req, res) => {
  try {
    const { coin, rupee, discount, tag, dollar, productKey } = req.body;
    const { planId } = req.params;

    const flashCoin = await FlashCoin.findById(planId);

    if (!flashCoin) {
      return res
        .status(200)
        .send({ status: false, message: 'plan not exists' });
    }
    flashCoin.coin = coin || flashCoin.coin;
    flashCoin.tag = tag || '';
    flashCoin.rupee = rupee || flashCoin.rupee;
    flashCoin.dollar = dollar || flashCoin.dollar;
    flashCoin.productKey = productKey || flashCoin.productKey;
    flashCoin.discount = discount || flashCoin.discount;
    flashCoin.image = req.file
      ? process?.env?.BASE_URL + req.file.path
      : flashCoin.image;

    const pay = (flashCoin.rupee * flashCoin.discount) / 100;
    flashCoin.rupeeWithDiscount = flashCoin.rupee - Math.floor(pay);

    await flashCoin.save();

    return res.status(200).send({
      status: true,
      message: 'update successfully',
      response: flashCoin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.activeEnableDeseble = async (req, res) => {
  try {
    const flashCoin = await FlashCoin.findById(req.params.planId);

    flashCoin.isActive = !flashCoin.isActive;

    await flashCoin.save();

    return res.status(200).json({
      status: true,
      message: 'success!!',
      response: flashCoin,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

exports.destroy = async (req, res) => {
  try {
    if (!req.params.planId) {
      return res
        .status(200)
        .json({ status: false, message: 'Plan Id is required !' });
    }

    const flashCoin = await FlashCoin.findById(req.params.planId);

    await flashCoin.deleteOne();
    return res
      .status(200)
      .json({ status: true, message: 'Deleted successfully ' });
  } catch (error) {
    return res.status(500);
  }
};
