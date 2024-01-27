// express
const express = require('express');

const route = express.Router();

// multer
const multer = require('multer');
const storage = require('../../middleware/multer');

const upload = multer({
  storage,
});

// admin controller
const AdminController = require('../../controller/admin/admin');
const admin = require('../../middleware/admin');

// create admin
route.post('/create', upload.single('image'), AdminController.store);

// admin login
route.post('/login', AdminController.login);

route.get('/profile', admin, AdminController.getProfile);

route.put('/updateAdminPassword', admin, AdminController.updateAdminPassword);

route.patch('/update', admin, upload.single('image'), AdminController.update);

module.exports = route;
