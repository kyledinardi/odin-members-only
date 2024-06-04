const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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
        res.redirect('/');
      });
    }
  }),
];
