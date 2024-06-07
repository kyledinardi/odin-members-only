const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');

exports.index = asyncHandler(async (req, res, next) => {
  const [users, messages] = await Promise.all([
    User.find().exec(),
    Message.find().sort({ timestamp: 1 }).exec(),
  ]);

  console.log(req.user);

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

      await Promise.all([
        message.save(),
        User.findByIdAndUpdate(
          req.user._id,
          {
            messages: currentUserMessages,
            _id: req.user._id,
          },
          {},
        ),
      ]);

      res.redirect('/');
    }
  }),
];

exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const users = await User.find({}, 'messages').exec();
  let userWithMessage;
  let newUserMessages;

  users.forEach((user) => {
    if (user.messages.includes(req.body.messageId)) {
      userWithMessage = user._id;
      newUserMessages = [...user.messages];
      const i = newUserMessages.indexOf(req.body.messageId);
      newUserMessages.splice(i, 1);
    }
  });

  await Promise.all([
    Message.findByIdAndDelete(req.body.messageId),
    User.findByIdAndUpdate(userWithMessage, { messages: newUserMessages }, {}),
  ]);

  res.redirect('/');
});
