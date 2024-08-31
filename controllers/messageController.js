const asyncHandler = require('express-async-handler');
const db = require('../db/queries');

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await db.getAllMessages();
  return res.render('index', {
    title: 'Members Only',
    currentUser: req.user,
    messages,
  });
});

exports.newMessage = asyncHandler(async (req, res, next) => {
  const message = {
    userId: req.user.id,
    title: req.body.title,
    timestamp: new Date(),
    text: req.body.messageBody,
  };

  await db.createMessage(message);
  return res.redirect('/');
});

exports.deleteMessage = asyncHandler(async (req, res, next) => {
  db.deleteMessage(req.body.messageId);
  return res.redirect('/');
});
