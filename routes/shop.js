const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");
const ensurePageQuery = require("../middleware/ensurePageQuery");

const router = express.Router();

router.get("/", ensurePageQuery, shopController.getIndex);

router.get("/products", ensurePageQuery, shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteItem);

// router.post("/create-order", isAuth, shopController.postOrder);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", isAuth, shopController.getCheckout);

router.post("/create-checkout-session", isAuth, shopController.postCheckout);

module.exports = router;
