const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');

exports.signUpGet = (req, res, next) => {
  res.render('signUp', {
    title: 'Sign Up',
    currentUser: req.user,
  });
};

exports.signUpPost = [
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must not be empty'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must not be empty'),
  asyncHandler(
    body('username')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage('Username must not be empty')
      .custom(async (value) => {
        const userInDatabase = await User.find({ username: value }).exec();
        return !userInDatabase;
      })
      .withMessage('Username taken'),
  ),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Password must not be empty'),
  body('passwordConfirmation')
    .trim()
    .escape()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords did not match'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('signUp', {
        title: 'Sign Up',
        currentUser: req.user,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          throw new Error(err);
        }

        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hashedPassword,
          membershipStatus: false,
        });

        await user.save();
        req.login(user, (error) => {
          if (!error) {
            res.redirect('/');
          } else {
            next(err);
          }
        });
      });
    }
  }),
];

exports.loginGet = (req, res, next) => {
  res.render('login', {
    title: 'Log In',
    currentUser: req.user,
  });
};

exports.loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    } else {
      res.redirect('/');
    }
  });
};

exports.joinClubGet = (req, res, next) => {
  res.render('secretCode', {
    title: 'Join Club',
    currentUser: req.user,
  });
};

exports.joinClubPost = [
  body('secretCode')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Secret code must not be empty')
    .custom((value) => value === process.env.SECRET_CODE)
    .withMessage('Incorrect secret code'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('secretCode', {
        title: 'Join Club',
        currentUser: req.user,
        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { membershipStatus: true, _id: req.user._id },
        {},
      );
      res.redirect('/');
    }
  }),
];

exports.adminGet = (req, res, next) => {
  res.render('secretCode', {
    title: 'Become Admin',
    currentUser: req.user,
  });
};

exports.adminPost = [
  body('secretCode')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Secret code must not be empty')
    .custom((value) => value === process.env.ADMIN_CODE)
    .withMessage('Incorrect secret code'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('secretCode', {
        title: 'Become Admin',
        currentUser: req.user,
        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          membershipStatus: true,
          admin: true,
          _id: req.user._id,
        },
        {},
      );

      res.redirect('/');
    }
  }),
];
