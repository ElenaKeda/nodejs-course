const bcrypt = require("bcryptjs");

const User = require("../models/user");
const user = require("../models/user");

const transporter = require("../util/mail");

exports.getLogin = (req, res, next) => {
  const message = req.flash("error");

  res.render("auth/login", {
    docTitle: "Login Page",
    path: "/login",
    styles: ["/css/forms.css", "/css/auth.css"],
    errorMessage: message[0],
  });
};

exports.getSignup = (req, res, next) => {
  const message = req.flash("error");

  res.render("auth/signup", {
    docTitle: "Signup Page",
    path: "/signup",
    styles: ["/css/forms.css", "/css/auth.css"],
    errorMessage: message[0],
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      req.flash("error", "Invalid email");
      return res.redirect("/signup");
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isCorrectPassword) {
      req.flash("error", "Invalid password");
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
      req.flash("error", "User already exists");
      return res.redirect("/login");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Invalid password");
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

    await transporter.sendMail({
      to: email,
      from: "shop@example.com",
      subject: "Signup succeeded!",
      html: "<h1>Welcome to the shop!</h1>",
    });
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
