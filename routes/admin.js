const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/add-product", (req, res, next) => {
  console.log("Add product!");
  res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
});

router.post("/add-product", (req, res, next) => {
  console.log("Product", req.body);
  res.redirect("/");
});

module.exports = router;
