const express = require('express');

const route = express.Router();
const multer = require('multer');
const agencyController = require('../../controller/admin/agency');
const checkAccess = require('../../middleware/checkAccess');
const storage = require('../../middleware/multer');

const upload = multer({ storage });
const agencyMiddleware = require('../../middleware/agency');

route.post('/', checkAccess(), upload.single('image'), agencyController.store);

route.post('/login', agencyController.login);

// get agency for admin panel
route.get('/', checkAccess(), agencyController.getAgency);

// age agency for create host
route.get('/all', checkAccess(), agencyController.getAgencyForCreateHost);

route.post(
  '/updateAgencyPassword',
  agencyMiddleware,
  agencyController.updateAgencyPassword
);

route.patch(
  '/update/:agencyId',
  checkAccess(),
  upload.single('image'),
  agencyController.updateAgency
);

route.put(
  '/disable/:agencyId',
  checkAccess(),
  agencyController.enbleDisebleAgency
);

route.get('/profile/:id', checkAccess(), agencyController.getProfile);

// create fake agency for fake host
route.post('/fakeAgency', checkAccess(), agencyController.cretaeFakeAgency);

// delete fake agency
route.delete('/fakeAgency/:agencyId', checkAccess(), agencyController.deleteFakeAgency);
module.exports = route;
