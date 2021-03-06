const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', {title: 'Login'});
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register', user: {} });
}

exports.registerUser = async (req, res, next) => {
  const user = new User({email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);

  await register(user, req.body.password);
  next();
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must provide a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false, 
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password_confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password_confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash(), user: req.body });

    return;
  }

  next();
}

exports.updateAccount = async (req, res) => {
  const updates = { 
    name: req.body.name, 
    email: req. body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates }, 
    { new: true, runValidators: true, context: 'query' }
  ); 

  res.redirect('back')
}

exports.account = (req, res) => {
  res.render('account', { title: 'My Account'});
}