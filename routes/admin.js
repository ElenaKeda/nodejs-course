const express = require("express");

const router = express.Router();

router.get("/add", (req, res, next) => {
  console.log("Add product!");
  res.send(
    '<form action="/product" method="POST"><input type="text" name="title"></input><button type="submit">Send</button></form>',
  );
});

router.post("/product", (req, res, next) => {
  console.log("Product", req.body);
  res.redirect("/");
});

module.exports = router;
