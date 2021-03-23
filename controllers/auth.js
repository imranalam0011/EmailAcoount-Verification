const User = require("../models/user");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

/*
//create user without email account verification
exports.signup = (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res
        .status(400)
        .json({ error: "User with this email is already exists." });
    }
    let newUser = new User({ name, email, password });
    newUser.save((err, success) => {
      if (err) {
        console.log("Error in signup: ", err);
        return res.status(400), json({ error: err });
      }
      res.json({
        message: "signup success",
      });
    });
  });
};
*/

exports.signup = (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  User.findOne({ email }).exec((err, user) => {
    // if (user) {
    //   return res
    //     .status(400)
    //     .json({ error: "User with this email is already exists." });
    // }

    const token = jwt.sign(
        { name, email, password },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "20m" }
    );

    const mailOptions = {
        from: "no-reply@gmail.com",
        to: email,
        subject: "Account Activation Link",
        html: `
        <h2> Please click on given link to activate your account </h2>
        <p> ${process.env.CLIENT_URL}/authentication/activate/${token} </p>
        `,
        };
      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            res.json({
              message: "Email has been sent",
            });
            console.log("Email sent: " + info.response);
          }
      });
    });
};

exports.activateAccount = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACC_ACTIVATE,
      function (err, decodedToken) {
        if (err) {
          return res.status(400).json({ error: "Incorrect or Expired Link" });
        }
        const { name, email, password } = decodedToken;

        User.findOne({ email }).exec((err, user) => {
          if (user) {
            return res
              .status(400)
              .json({ error: "User with this email is already exists." });
          }
          let newUser = new User({ name, email, password });
          newUser.save((err, success) => {
            if (err) {
              console.log("Error in signup while acccount activation : ", err);
              return (
                res.status(400), json({ error: "Error activating account" })
              );
            }
            res.json({
              message: "signup success",
            });
          });
        });
      }
    );
  } else {
    return res.json({ error: "something went wrong" });
  }
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: "user with this email does not exist" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "20m",
    });
    const mailOptions = {
      from: "no-reply@gmail.com",
      to: email,
      subject: "Account Activation Link",
      html: `
        <h2> Please click on given link to reset your password </h2>
        <p> ${process.env.CLIENT_URL}/resetpasssword/${token} </p>
         `,
    };

    return user.updateOne({ resetLink: token }, function (err, success) {
      if (err) {
        return res.status(400).json({ error: "reset password link error" });
      } else {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            res.json({
              message: "Email has been sent",
            });
            console.log("Email sent: " + info.response);
          }
        });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetLink, newPass } = req.body;
  if (resetLink) {
    jwt.verify(
      resetLink,
      process.env.RESET_PASSWORD_KEY,
      function (error, decodedData) {
        if (error) {
          return res.status(401).json({
            error: "Incorrect token or it is expired",
          });
        }
        User.findOne({ resetLink }, (err, user) => {
          if (err || !user) {
            return res
              .status(400)
              .json({ error: "User with this token does not exist" });
          }
          const obj = {
            password: newPass,
            resetLink: ''
          };

          user = _.extend(user, obj);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({ error: "reset password error" });
            } else {
              return res
                .status(200)
                .json({ message: "Your password has been changed" });
            }
          });
        });
      }
    );
  } else {
    return res.status(401).json({ error: "Authentication error" });
  }
};
