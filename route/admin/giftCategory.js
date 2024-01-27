const express = require('express');

const route = express.Router();
const multer = require('multer');
const storage = require('../../middleware/multer');
const CategoryController = require('../../controller/admin/giftCategory');
const checkAccess = require('../../middleware/checkAccess');

const upload = multer({ storage });

// get category
route.get('/allCategory', checkAccess(), CategoryController.allCategory);

route.post(
  '/',
  checkAccess(),
  upload.single('image'),
  CategoryController.store
);

// update category
route.patch(
  '/:categoryId',
  checkAccess(),
  upload.single('image'),
  CategoryController.update
);

// delete category
route.delete('/:categoryId', checkAccess(), CategoryController.destroy);

// active inactive category
route.put('/:categoryId', checkAccess(), CategoryController.handleToggle);
module.exports = route;
