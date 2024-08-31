const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const db = require('../db/queries');

exports.signUpGet = (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }

  return res.render('signUp', { title: 'Sign Up' });
};

exports.signUpPost = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name must not be empty'),

  body('lastName').trim().notEmpty().withMessage('Last name must not be empty'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username must not be empty')
    .custom(async (value) => {
      const existingUser = await db.getUserByUsername(value);

      if (existingUser) {
        throw new Error('Username already in use');
      }
    }),

  body('password').trim().notEmpty().withMessage('Password must not be empty'),

  body('passwordConfirmation')
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords did not match'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('signUp', {
        title: 'Sign Up',
        currentUser: req.user,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        errors: errors.array(),
      });
    }

    return bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        throw new Error(err);
      }

      const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        isMember: false,
        isAdmin: false,
      };
      const userId = await db.createUser(user);
      user.id = userId;

      req.login(user, (error) => {
        if (!error) {
          return res.redirect('/');
        }

        return next(error);
      });
    });
  }),
];

exports.loginGet = (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }

  return res.render('login', { title: 'Log In' });
};

exports.loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
};

exports.joinClubGet = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  return res.render('secretCode', {
    title: 'Join Club',
    currentUser: req.user,
  });
};

exports.joinClubPost = [
  body('secretCode')
    .trim()
    .notEmpty()
    .withMessage('Secret code must not be empty')
    .custom((value) => value === process.env.SECRET_CODE)
    .withMessage('Incorrect secret code'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('secretCode', {
        title: 'Join Club',
        currentUser: req.user,
        errors: errors.array(),
      });
    }

    await db.updateUserMembership(req.user.id);
    return res.redirect('/');
  }),
];

exports.adminGet = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  return res.render('secretCode', {
    title: 'Become Admin',
    currentUser: req.user,
  });
};

exports.adminPost = [
  body('secretCode')
    .trim()
    .notEmpty()
    .withMessage('Secret code must not be empty')
    .custom((value) => value === process.env.ADMIN_CODE)
    .withMessage('Incorrect secret code'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('secretCode', {
        title: 'Become Admin',
        currentUser: req.user,
        errors: errors.array(),
      });
    }
    await db.updateUserAdminStatus(req.user.id);
    return res.redirect('/');
  }),
];
