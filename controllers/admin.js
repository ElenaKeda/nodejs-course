const { validationResult } = require("express-validator");

const fileHelper = require("../util/file");

const Product = require("../models/product");
const { getPaginatedProducts } = require("../util/helpers");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    styles: ["/css/product.css", "/css/forms.css"],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      docTitle: "Add Product",
      path: "/admin/add-product",
      styles: ["/css/product.css", "/css/forms.css"],
      product: { title, price, description },
      hasError: true,
      errorMessage: "Attached file is not an image! Please choose another one!",
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      docTitle: "Add Product",
      path: "/admin/add-product",
      styles: ["/css/product.css", "/css/forms.css"],
      product: { title, image, price, description },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId: req.user,
  });

  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;

  Product.findById(productId)
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      docTitle: "Edit Product",
      path: "/admin/edit-product",
      styles: ["/css/product.css", "/css/forms.css"],
      product: {
        _id: productId,
        title: updatedTitle,
        image: updatedImage,
        price: updatedPrice,
        description: updatedDescription,
      },
      hasError: true,
      editing: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;

      if (updatedImage) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImage.path;
      }

      product.save().then(() => res.redirect("/admin/products"));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    fileHelper.deleteFile(product.imageUrl);

    await Product.deleteOne({
      _id: product._id,
    });

    res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;

    const data = await getPaginatedProducts({ userId: req.user._id }, page);

    res.render("admin/products", {
      prods: data.products,
      currentPage: data.currentPage,
      totalItems: data.totalItems,
      itemsPerPage: data.itemsPerPage,
      docTitle: "Admin Products",
      path: "/admin/products",
      styles: ["/css/product.css"],
    });
  } catch (err) {
    next(err);
  }
};
