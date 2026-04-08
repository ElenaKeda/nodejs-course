const express = require("express");
const path = require("path");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];

router.get("/add-product", (req, res, next) => {
  console.log("Add product!");
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

router.post("/add-product", (req, res, next) => {
  console.log("Product", req.body);
  products.push({ title: req.body.title });
  res.redirect("/");
});

// example
// exports.router = router;
// exports.products = products;
module.exports = { router, products };
