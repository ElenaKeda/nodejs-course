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
  Cart.getCart((cart) => {
    Product.findAll()
      .then((products) => {
        const cartProducts = [];
        for (product of products) {
          const cartProductData = cart.products.find(
            (prod) => prod.id === product.id,
          );
          if (cartProductData) {
            cartProducts.push({
              productData: product,
              quantity: cartProductData.quantity,
            });
          }
        }
        res.render("shop/cart", {
          docTitle: "Cart",
          path: "/cart",
          products: cartProducts,
          totalPrice: cart.totalPrice,
        });
      })
      .catch((err) => console.log({ getCartError: err }));
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findByPk(productId)
    .then((product) => {
      Cart.addProduct(productId, product.price);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log({ postCartErr: err }));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;

  Product.findByPk(productId)
    .then((product) => {
      Cart.deleteProduct(productId, product.price);
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
