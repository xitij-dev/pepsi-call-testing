const express = require('express');

const route = express.Router();
const multer = require('multer');
const GiftController = require('../../controller/admin/gift');
const checkAccess = require('../../middleware/checkAccess');
const storage = require('../../middleware/multer');

const upload = multer({ storage });
// get all gifts
route.get('/all', checkAccess(), GiftController.index);

// gift catagery wise
route.get('/', checkAccess(), GiftController.categoryWiseGift);

// create gift
route.post('/', checkAccess(), upload.any(), GiftController.store);

// update gift
route.patch(
  '/:giftId',
  checkAccess(),
  upload.single('image'),
  GiftController.update
);

// delete image
route.delete('/:giftId', checkAccess(), GiftController.destroy);

module.exports = route;
