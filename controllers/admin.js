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

  const product = new Product({
    id: null,
    title,
    imageUrl,
    price,
    description,
  });

  product
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.log({ postAddProductError: err }));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;

  Product.findById(productId)
    .then(([products]) => {
      const product = products[0];

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

  const updatedProduct = new Product({
    id: productId,
    title: updatedTitle,
    imageUrl: updatedImageUrl,
    price: updatedPrice,
    description: updatedDescription,
  });

  updatedProduct
    .update()
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.deleteById(productId)
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log({ postDeleteProductErr: err }));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("admin/products", {
        prods: rows,
        docTitle: "Admin Products",
        path: "/admin/products",
        styles: ["/css/product.css"],
      });
    })
    .catch((err) => console.log({ getProductsError: err }));
};
