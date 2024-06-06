const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  membershipStatus: { type: Boolean, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  admin: { type: Boolean },
});

UserSchema.virtual('fullName').get(function cb() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = model('User', UserSchema);
