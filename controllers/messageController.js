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

exports.newMessage = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Message title must not be empty'),
  body('messageBody')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Message body must not be empty'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      timestamp: Date.now(),
      text: req.body.messageBody,
    });

    if (!errors.isEmpty()) {
      const [users, messages] = await Promise.all([
        User.find().exec(),
        Message.find().sort({ timestamp: 1 }).exec(),
      ]);

      res.render(
        res.render('index', {
          title: 'Members Only',
          currentUser: req.user,
          users,
          messages,
          messageTitle: req.body.title,
          messageBody: req.body.messageBody,
          errors: errors.array(),
        }),
      );
    } else {
      const currentUserMessages = req.user.messages;
      currentUserMessages.push(message._id);
      await message.save();

      await User.findByIdAndUpdate(
        req.user._id,
        {
          messages: currentUserMessages,
          _id: req.user._id,
        },
        {},
      );
      
      res.redirect('/');
    }
  }),
];
