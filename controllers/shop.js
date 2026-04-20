const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        prods: rows,
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
    .then(([product]) => {
      res.render("shop/product-detail", {
        product: product[0],
        docTitle: "Product Detail",
        path: "/products",
      });
    })
    .catch((err) => console.log({ getProductErr: err }));
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/index", {
        prods: rows,
        docTitle: "Shop",
        path: "/",
        styles: ["/css/product.css"],
      });
    })
    .catch((err) => console.log({ getIndexError: err }));
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll()
      .then(([rows, fieldData]) => {
        const cartProducts = [];
        for (product of rows) {
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

  Product.findById(productId)
    .then(([product]) => {
      Cart.addProduct(productId, product[0].price);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log({ postCartErr: err }));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then(([product]) => {
      Cart.deleteProduct(productId, product[0].price);
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
