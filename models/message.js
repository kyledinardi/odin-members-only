const { Schema, model } = require('mongoose');

const MessageSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, required: true },
  text: { type: String, required: true },
});

module.exports = model('Message', MessageSchema);
