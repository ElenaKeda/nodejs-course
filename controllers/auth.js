const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const User = require("../models/user");

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
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        docTitle: "Login Page",
        path: "/login",
        styles: ["/css/forms.css", "/css/auth.css"],
        errorMessage: errors.array()[0].msg,
      });
    }

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        docTitle: "Signup Page",
        path: "/signup",
        styles: ["/css/forms.css", "/css/auth.css"],
        errorMessage: errors.array()[0].msg,
        oldInput: { email, password, confirmPassword },
        validationErrors: errors.array(),
      });
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

exports.getReset = (req, res, next) => {
  const message = req.flash("error");

  res.render("auth/reset", {
    docTitle: "Reset Password Page",
    path: "/reset",
    styles: ["/css/forms.css", "/css/auth.css"],
    errorMessage: message[0],
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log({ postResetErr: err });
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found!");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
      })
      .then(() => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "shop@example.com",
          subject: "Password reset!",
          html: `
            <p>You requested a password reset!</p>
            <p>Click this <a href="/${process.env.HOST}:${process.env.PORT}/reset/${token}">Link</a> to set a new password</p>
          `,
        });

        // TODO remove it!
        console.log({
          htmlLink: `${process.env.HOST}:${process.env.PORT}/reset/${token}`,
        });
      })
      .catch((err) => console.log({ postResetUserErr: err }));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      // TODO remove it!
      console.log({ user });
      const message = req.flash("error");

      res.render("auth/new-password", {
        docTitle: "New Password Page",
        path: "/reset/:token",
        styles: ["/css/forms.css", "/css/auth.css"],
        errorMessage: message[0],
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log({ getNewPasswordErr: err }));
};

// TODO does not work correctly
exports.postNewPassword = async (req, res, next) => {
  try {
    const { password: newPassword, userId, passwordToken } = req.body;

    const existingUser = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!existingUser) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    existingUser.password = hashedPassword;
    existingUser.resetToken = null;
    existingUser.resetTokenExpiration = null;

    await existingUser.save();

    res.redirect("/login");
  } catch (err) {
    console.log({ postNewPasswordErr: err });
  }
};
