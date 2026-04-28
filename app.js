const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");

const errorController = require("./controllers/error");

const User = require("./models/user");

const mongoConnect = require("./util/database").mongoConnect;

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
  User.findById("69f0d8874bd672353e07a7af")
    .then((user) => {
      req.user = new User({
        name: user.name,
        email: user.email,
        cart: user.cart,
        id: user._id,
      });
      next();
    })
    .catch((err) => console.log({ initializeErr: err }));
});

app.use("/admin", adminRouter);
app.use(shopRouter);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});
