const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");

const errorController = require("./controllers/error");

const User = require("./models/user");

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
  User.findById("69f37b230a42acd53f4a7247")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log({ initializeErr: err }));
});

app.use("/admin", adminRouter);
app.use(shopRouter);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb://elenakedamail_db_user:<password>@ac-nbsuhc2-shard-00-00.ixpnbhi.mongodb.net:27017,ac-nbsuhc2-shard-00-01.ixpnbhi.mongodb.net:27017,ac-nbsuhc2-shard-00-02.ixpnbhi.mongodb.net:27017/?ssl=true&replicaSet=atlas-tdt8x2-shard-0&authSource=admin&appName=Cluster0",
  )
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Lena",
          email: "test@test@com",
          cart: { items: [] },
        });
        user.save();
      }
    });
    console.log("Connected!");

    app.listen(3000);
  })
  .catch((err) => console.log({ mongooseConnectErr: err }));
