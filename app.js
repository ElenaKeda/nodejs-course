const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongo").default;
const csrf = require("csurf");
const flash = require("connect-flash");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");

const errorController = require("./controllers/error");

const User = require("./models/user");

const MONGO_DB_URI =
  "mongodb://elenakedamail_db_user:<password>@ac-nbsuhc2-shard-00-00.ixpnbhi.mongodb.net:27017,ac-nbsuhc2-shard-00-01.ixpnbhi.mongodb.net:27017,ac-nbsuhc2-shard-00-02.ixpnbhi.mongodb.net:27017/?ssl=true&replicaSet=atlas-tdt8x2-shard-0&authSource=admin&appName=Cluster0";

const app = express();
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views"); // second argument - name of the folder "views"

app.use(
  session({
    secret: "secret_for_example",
    resave: false,
    saveUninitialized: false,
    store: MongoDbStore.create({
      mongoUrl: MONGO_DB_URI,
    }),
  }),
);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(flash());

app.use(csrfProtection);

app.use((req, res, next) => {
  // for ejs templates - if path and styles are undefinied
  res.locals.path = req.path;
  res.locals.styles = [];
  res.locals.editing = false;
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.errorMessage = null;

  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  if (!req.session.userId) return next();

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return next();

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

app.use(authRouter);
app.use("/admin", adminRouter);
app.use(shopRouter);

app.use(errorController.get404);

mongoose
  .connect(MONGO_DB_URI)
  .then(() => {
    console.log("Connected!");

    app.listen(3000);
  })
  .catch((err) => console.log({ mongooseConnectErr: err }));
