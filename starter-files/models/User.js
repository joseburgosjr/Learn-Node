const mongoose = require('mongoose');
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
const userSchema = new Schema({
  email: {
    type: String,
    trim: true, 
    required: 'Please enter your email!',
    validate: [validator.isEmail, 'Invalid Email Address'],
    lowercase: true,
    unique: true
  },
  name: {
    type: String, 
    trim: true, 
    required: 'Please enter your name!'
  },
  resetPasswordToken: String, 
  resetPasswordExpires: Date
});

userSchema.virtual('gravatar').get(function () {
  const hash = md5(this.email);

  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);
module.exports = mongoose.model('User', userSchema);