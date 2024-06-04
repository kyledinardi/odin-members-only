const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');

exports.index = asyncHandler(async (req, res, next) => {
  const [users, messages] = await Promise.all([
    User.find().exec(),
    Message.find().sort({ timestamp: 1 }).exec(),
  ]);

  res.render('index', {
    title: 'Members Only',
    currentUser: req.user,
    users,
    messages,
  });
});

exports.newMessage = asyncHandler(async (req, res, next) => {});
