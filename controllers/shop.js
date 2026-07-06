const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const { getPaginatedProducts } = require("../util/helpers");

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;

    const data = await getPaginatedProducts({}, page);

    res.render("shop/product-list", {
      prods: data.products,
      currentPage: data.currentPage,
      totalItems: data.totalItems,
      itemsPerPage: data.itemsPerPage,
      docTitle: "All Products",
      path: "/products",
      styles: ["/css/product.css"],
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product,
        docTitle: "Product Detail",
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;

    const data = await getPaginatedProducts({}, page);

    res.render("shop/index", {
      prods: data.products,
      currentPage: data.currentPage,
      totalItems: data.totalItems,
      itemsPerPage: data.itemsPerPage,
      docTitle: "Shop",
      path: "/",
      styles: ["/css/product.css"],
    });
  } catch (err) {
    next(err);
  }
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => ({
        ...item.productId._doc,
        quantity: item.quantity,
      }));

      const totalPrice = products.reduce((total, product) => {
        return total + +product.price * product.quantity;
      }, 0);

      res.render("shop/cart", {
        docTitle: "Cart",
        path: "/cart",
        products,
        totalPrice,
        styles: ["/css/cart.css"],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .deleteFromCart(productId)
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => ({
        product: { ...item.productId._doc },
        quantity: item.quantity,
      }));

      const order = new Order({
        user: { email: req.user.email, userId: req.user },
        products,
      });

      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        docTitle: "Orders",
        path: "/orders",
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((currentOrder) => {
      if (!currentOrder) {
        return next(new Error("No order found!"));
      }
      if (currentOrder.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join(
        __dirname,
        "..",
        "data",
        "invoices",
        invoiceName,
      );

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoiceName}"`,
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(24).text("Invoice");

      pdfDoc.moveDown();

      let totalPrice = 0;

      currentOrder.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;

        pdfDoc
          .fontSize(14)
          .text(
            `${prod.product.title} - ${prod.quantity} × $${prod.product.price}`,
          );
      });

      pdfDoc.moveDown();

      pdfDoc.fontSize(20).text(`Total: $${totalPrice}`);

      pdfDoc.end();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStattusCode = 500;
      return next(error);
    });
};
