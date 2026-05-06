const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  features: [String],
  pages: Number,
  revisions: Number,
  deliveryDays: Number,
  popular: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
