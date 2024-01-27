const express = require('express');
const multer = require('multer');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();
const storage = require('../../middleware/multer');

const upload = multer({ storage });
const flashCoinController = require('../../controller/admin/flashCoin');

route.post(
  '/',
  checkAccess(),
  upload.single('image'),
  flashCoinController.store
);

route.patch(
  '/:planId',
  checkAccess(),
  upload.single('image'),
  flashCoinController.updateFlashCoin
);

route.get('/', checkAccess(), flashCoinController.getFlashCoin);

// get coinplan for android
route.get('/getPlan', checkAccess(), flashCoinController.getPlan);

route.put('/:planId', checkAccess(), flashCoinController.activeEnableDeseble);

route.delete('/:planId', checkAccess(), flashCoinController.destroy);
module.exports = route;
