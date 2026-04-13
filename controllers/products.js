const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("add-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    styles: ["/css/product.css", "/css/forms.css"],
  });
};

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);

  product.save();

  console.log({ product });

  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop", {
      prods: products,
      docTitle: "Shop",
      path: "/",
      styles: ["/css/product.css"],
    });
  });
};
