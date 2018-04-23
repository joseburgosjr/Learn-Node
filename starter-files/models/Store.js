const mongoose = require('mongoose');
const slug = require('slugs');
const storeSchema = new mongoose.Schema({
  name: {
    type: String, 
    trim: true, 
    required: 'Please enter a store name!'
  },
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  slug: String, 
  photo: String,
  created: {
    type: Date, 
    default: Date.now
  }, 
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number, 
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply and address!'
    }
  }
});

storeSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next();
    return;
  }

  this.slug = slug(this.name);

  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({slug: slugRegex});

  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

module.exports = mongoose.model('Store', storeSchema);