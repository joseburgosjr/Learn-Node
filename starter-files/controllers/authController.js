const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You have logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();

    return;
  }

  req.flash('error', 'Oops, you must be logged in to do that!');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  let resetUrl = '';

  if (user) {
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  }

  req.flash('success', `You have been emailed a password reset link. ${resetUrl}`);

  return res.redirect('/login');
}

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gte: Date.now() }
  });

  if (!user) { 
    req.flash('error', 'Password reset is invalid or has been expired.');

    return res.redirect('/login');
  }
  
  res.render('reset', { title: 'Reset your password' });
}