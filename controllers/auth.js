const bcrypt = require("bcryptjs");

const User = require("../models/user");
const user = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    docTitle: "Login Page",
    path: "/login",
    styles: ["/css/forms.css", "/css/auth.css"],
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    docTitle: "Signup Page",
    path: "/signup",
    styles: ["/css/forms.css", "/css/auth.css"],
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.redirect("/signup");
    }

    const isCorrectPassword = await bcrypt.compare(password, existingUser.password);

    if (!isCorrectPassword) {
      return res.redirect("/login");
    }

    req.session.isLoggedIn = true;
    req.session.userId = existingUser._id;

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.log({ postLoginErr: err });
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect("/login");
    }

    if (password !== confirmPassword) {
      return res.redirect("/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });

    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.log({ postSignUserErr: err });
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log({ postLogout: err });

    res.redirect("/login");
  });
};
