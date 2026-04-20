const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const errorController = require("./controllers/error");

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

app.use("/admin", adminRouter);
app.use(shopRouter);

app.use(errorController.get404);

app.listen(3000);
