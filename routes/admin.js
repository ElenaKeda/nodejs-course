const express = require("express");
const { check, body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

const bodyCheckForProductEntuty = [
  body("title").isString().isLength({ min: 3 }).trim(),
  body("imageUrl").isURL(),
  body("price").isFloat(),
  body("description").isLength({ min: 5, max: 255 }).trim(),
];

// admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// admin/add-product => POST
router.post(
  "/add-product",
  [...bodyCheckForProductEntuty],
  isAuth,
  adminController.postAddProduct,
);

// admin/add-product/:productId => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// admin/add-product => POST
router.post(
  "/edit-product",
  [...bodyCheckForProductEntuty],
  isAuth,
  adminController.postEditProduct,
);

// admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
