const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  dueDate: Date,
});

const fileSchema = new mongoose.Schema({
  name: String,
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['landing-page', 'ecommerce', 'saas', 'portfolio', 'web-app', 'custom'],
    default: 'custom',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'review', 'completed', 'cancelled'],
    default: 'pending',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  budget: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
  },
  features: [{
    type: String,
  }],
  designPreferences: {
    style: String,
    colors: [String],
    references: [String],
  },
  milestones: [milestoneSchema],
  files: [fileSchema],
  revisions: {
    type: Number,
    default: 0,
  },
  maxRevisions: {
    type: Number,
    default: 3,
  },
  package: {
    type: String,
    enum: ['starter', 'pro', 'premium', 'custom'],
    default: 'custom',
  },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
