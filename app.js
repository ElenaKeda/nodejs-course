const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expessHbs = require("express-handlebars");

const adminData = require("./routes/admin");
const shopRouter = require("./routes/shop");

const app = express();

app.engine(
  "handlebars",
  expessHbs({ layoutsDir: "views/layouts/", defaultLayout: "main-layout" }),
);
app.set("view engine", "handlebars");
// second argument - name of the folder "views"
app.set("views", "views");

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.router);
app.use(shopRouter);

app.use((req, res, next) => {
  res.status(404).render("404", { docTitle: "Page not found" });
});

app.listen(3000);
