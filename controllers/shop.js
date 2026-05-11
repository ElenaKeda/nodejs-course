const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        docTitle: "All Products",
        path: "/products",
        styles: ["/css/product.css"],
      });
    })
    .catch((err) => console.log({ getProductsError: err }));
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
    .catch((err) => console.log({ getProductErr: err }));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        docTitle: "Shop",
        path: "/",
        styles: ["/css/product.css"],
      });
    })
    .catch((err) => console.log({ getIndexError: err }));
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
    .catch((err) => console.log({ getCartError: err }));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log({ postCartErr: err }));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .deleteFromCart(productId)
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log({ postCartDeleteItemErr: err }));
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
    .catch((err) => console.log({ postOrderErr: err }));
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
    .catch((err) => console.log({ getOrdersErr: err }));
};
