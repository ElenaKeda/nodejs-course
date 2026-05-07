const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    docTitle: "Login Page",
    path: "/login",
    styles: ["/css/forms.css", "/css/auth.css"],
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("69f37b230a42acd53f4a7247")
    .then((user) => {
      // for an example, create a new session every time
      // req.session.regenerate((err) => {
      //   req.session.isLoggedIn = true;
      //   res.redirect("/");
      // });

      req.session.isLoggedIn = true;
      req.session.userId = user._id;

      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log({ postLogin: err }));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log({ postLogout: err });

    res.redirect("/login");
  });
};
