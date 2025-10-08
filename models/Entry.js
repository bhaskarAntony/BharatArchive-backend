const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const entrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['temple', 'ancient-tech', 'festival', 'monument', 'art', 'tradition', 'other']
  },
  imageUrls: [{
    type: String,
    required: true
  }],
  content: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true
  },
  metaDescription: {
    type: String,
    default: ''
  },
  keywords: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

entrySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  this.updatedAt = Date.now();
  next();
});

entrySchema.index({ title: 'text', content: 'text', location: 'text', category: 'text' });

module.exports = mongoose.model('Entry', entrySchema);
