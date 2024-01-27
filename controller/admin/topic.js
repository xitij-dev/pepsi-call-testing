const Topic = require('../../model/topic');

// store topic
exports.store = async (req, res) => {
  try {
    const { topic, type } = req?.body;
    if (!topic || !type) {
      return res
        .status(500)
        .send({ status: false, message: 'Invalid details' });
    }
    const topicArray = Array.isArray(topic) ? topic : [topic];

    const data = [];
    for (let index = 0; index < topicArray[0].split(',').length; index += 1) {
      const element = topicArray[0].split(',')[index];

      data.push(element);
    }
    const newTopic = new Topic();
    newTopic.topic = data;
    newTopic.type = type;

    await newTopic.save();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', data: newTopic });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// get all topic
exports.getAll = async (req, res) => {
  try {
    const data = await Topic.find();

    return res
      .status(200)
      .send({ status: true, message: 'success!!', topic: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// add seprated topic
exports.addTopic = async (req, res) => {
  try {
    const { id } = req?.params;

    if (!id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const data = await Topic.findById(id);
    if (!data) {
      return res
        .status(200)
        .send({ status: false, message: 'topic not found' });
    }

    const topicArray = Array.isArray(req?.body?.topic)
      ? req?.body?.topic
      : [req?.body?.topic];

    for (let index = 0; index < topicArray[0].split(',').length; index += 1) {
      const element = topicArray[0].split(',')[index];

      data.topic.push(element);
    }

    await data.save();
    return res
      .status(200)
      .send({ status: true, message: 'success!!', topic: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};

// delete topic
exports.delete = async (req, res) => {
  try {
    const { id } = req?.params;

    if (!id) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }

    const data = await Topic.findById(id);
    const position = parseInt(req?.query?.position);
    if (!data) {
      return res
        .status(200)
        .send({ status: false, message: 'topic not found' });
    }

    await data.topic.splice(position, 1);

    await data.save();

    return res.status(200).send({ status: true, message: 'success!!', data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: 'Internal server error' });
  }
};
