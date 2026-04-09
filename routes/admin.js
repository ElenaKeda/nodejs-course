const express = require("express");

const router = express.Router();

const products = [];

router.get("/add-product", (req, res, next) => {
  console.log("Add product!");
  res.render("add-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    productCSS: true,
    formsCSS: true,
  });
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
