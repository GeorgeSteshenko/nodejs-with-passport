const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// User model
const User = require("../models/User");
const { request } = require("express");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Pregister Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 chars" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Vaildation passed
    const user = await User.findOne({ email: email });

    if (user) {
      // User exists
      errors.push({ msg: "Email is already registered" });
      res.render("register", {
        errors,
        name,
        email,
        password,
        password2,
      });
    } else {
      const newUser = new User({
        name,
        email,
        password,
      });

      // Hash password
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          newUser.password = hash;
          // Save user
          try {
            req.flash("success_msg", "You are now registered and can log in");
            const user = await newUser.save();
            res.redirect("/users/login");
          } catch (error) {
            console.log(error);
          }
        })
      );
    }
  }
});

// Login handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
