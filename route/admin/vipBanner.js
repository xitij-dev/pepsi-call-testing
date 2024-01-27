const express = require('express');

const route = express.Router();
const multer = require('multer');
const storage = require('../../middleware/multer');
const checkAccess = require('../../middleware/checkAccess');
const BannerController = require('../../controller/admin/vipBanner');

const upload = multer({ storage });

// get all banner for frontend
route.get('/all', checkAccess(), BannerController.index);

// get VIP and normal banner [android]
route.get('/', checkAccess(), BannerController.getBanner);

// create banner
route.post('/', checkAccess(), upload.single('image'), BannerController.store);

// update banner
route.patch(
  '/:bannerId',
  checkAccess(),
  upload.single('image'),
  BannerController.update
);

// VIP switch
route.put('/:bannerId', checkAccess(), BannerController.VIPBannerSwitch);

// delete banner
route.delete('/:bannerId', checkAccess(), BannerController.destroy);

module.exports = route;
