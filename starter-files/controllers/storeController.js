const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    if (!file.mimetype.includes('image/')) {
      next('This file type is not accepted', false);
    }

    next(null, true);
  }
}

exports.homePage = (req, res, next) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('edit-form', {title: 'Add Store'});
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  
  const extension = req.file.mimetype.split('/')[1];
  const photo = await jimp.read(req.file.buffer);

  req.body.photo = `${uuid.v4()}.${extension}`;
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // await
  next();
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();

  req.flash('success', `Successfully created ${store.name}, care to leave a review?`);
  res.redirect(`/stores/${store.slug}`);
}

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {title: 'Stores', stores});
}

exports.getStore = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug});

  if (!store) { 
    return next();
  }
  
  res.render('store', {title: store.name, store});
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({_id: req.params.id});

  res.render('edit-form', {title: `Edit ${store.name}` , store});
}

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // Return new store instead of original
    runValidators: true,
  }).exec();

  req.flash('success', `Successfully update ${store.name}. <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store.id}/edit`);
}

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery }); 
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', {title: 'Tags', tags, tag, stores });
}