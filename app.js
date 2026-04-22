const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const errorController = require("./controllers/error");

const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

const app = express();

app.set("view engine", "ejs");
// second argument - name of the folder "views"
app.set("views", "views");

app.use((req, res, next) => {
  // for ejs templates - if path and styles are undefinied
  res.locals.path = req.path;
  res.locals.styles = [];
  res.locals.editing = false;
  next();
});

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log({ initializeErr: err }));
});

app.use("/admin", adminRouter);
app.use(shopRouter);

app.use(errorController.get404);

// Associations
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product); //optional
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Lena", email: "test-email@mail.com" });
    }

    return user;
  })
  .then((user) => {
    return user
      .getCart()
      .then((cart) => {
        if (cart) {
          return cart;
        } else {
          return user.createCart();
        }
      })
      .catch((err) => console.log({ syncUserApp: err }));
  })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log({ syncApp: err }));
