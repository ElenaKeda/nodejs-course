const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  // example, instead of "Product.findByPk(productId)" (but result is not an array)
  // Product.findByPk(productId)

  Product.findAll({ where: { id: productId } })
    .then((products) => {
      res.render("shop/product-detail", {
        product: products[0],
        docTitle: "Product Detail",
        path: "/products",
      });
    })
    .catch((err) => console.log({ getProductErr: err }));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
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
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        docTitle: "Cart",
        path: "/cart",
        products,
        totalPrice: "0.00", // TODO
      });
    })
    .catch((err) => console.log({ getCartError: err }));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;

        return product;
      }
      return Product.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log({ postCartErr: err }));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log({ postCartDeleteItemErr: err }));
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    docTitle: "Orders",
    path: "/orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    docTitle: "Checkout",
    path: "/checkout",
  });
};
