const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    icon: {
      type: String,
      trim: true,
      default: '⚡' // High-energy fallback emoji
    },
    color: {
      type: String,
      trim: true,
      default: '#ff4757' // Vibrant neon-ish red default
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);