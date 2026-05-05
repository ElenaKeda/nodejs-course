exports.getLogin = (req, res, next) => {
  console.log({ cook: req.get("Cookie") });
  res.render("auth/login", {
    docTitle: "Login Page",
    path: "/login",
    styles: ["/css/forms.css", "/css/auth.css"],
  });
};

exports.postLogin = (req, res, next) => {
  // TODO only for an example - draft!
  res.setHeader("Set-Cookie", "loggedIn=true");

  res.redirect("/");
};
