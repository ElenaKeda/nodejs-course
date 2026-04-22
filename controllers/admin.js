const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    styles: ["/css/product.css", "/css/forms.css"],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  Product.create({ title, price, imageUrl, description })
    .then((result) => res.redirect("/"))
    .catch((err) => console.log({ postAddProductError: err }));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;

  Product.findByPk(productId)
    .then((product) => {
      if (!product) {
        res.redirect("/");
      }
      res.render("admin/edit-product", {
        docTitle: "Edit Product",
        path: "/admin/edit-product",
        styles: ["/css/product.css", "/css/forms.css"],
        editing: editMode,
        product,
      });
    })
    .catch((err) => console.log({ getEditProductErr: err }));
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Product.findByPk(productId)
    .then((product) => {
      product.title = updatedTitle;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDescription;

      return product.save();
    })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log({ postEditProduct: err }));

  // another way to update entity
  // Product.update(
  //   {
  //     id: productId,
  //     title: updatedTitle,
  //     imageUrl: updatedImageUrl,
  //     price: updatedPrice,
  //     description: updatedDescription,
  //   },
  //   { where: { id: productId } },
  // )
  //   .then(() => {
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => console.log({ postEditProduct: err }));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  // or directly use - Product.destroy({ where: { id: productId } })
  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log({ postDeleteProductErr: err }));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        docTitle: "Admin Products",
        path: "/admin/products",
        styles: ["/css/product.css"],
      });
    })
    .catch((err) => console.log({ getProductsError: err }));
};
