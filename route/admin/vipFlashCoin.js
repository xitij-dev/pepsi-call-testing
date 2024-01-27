const express = require('express');
const multer = require('multer');
const checkAccess = require('../../middleware/checkAccess');

const route = express.Router();
const storage = require('../../middleware/multer');

const upload = multer({ storage });
const vipFlashCoinController = require('../../controller/admin/vipFlashCoin');

route.post(
  '/',
  checkAccess(),
  upload.single('image'),
  vipFlashCoinController.store
);

route.patch(
  '/:planId',
  checkAccess(),
  upload.single('image'),
  vipFlashCoinController.updateFlashCoin
);

route.get('/', checkAccess(), vipFlashCoinController.getVipFlashCoin);

// get coinplan for android
route.get('/getPlan', checkAccess(), vipFlashCoinController.getPlan);

route.put('/:planId', checkAccess(), vipFlashCoinController.activeEnableDeseble);

route.delete('/:planId', checkAccess(), vipFlashCoinController.destroy);


module.exports = route;
