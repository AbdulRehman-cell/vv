const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters']
    },
    category: {
      type: String,
      required: [true, 'Category slug or name is required'],
      trim: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
      default: 0
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required'],
      min: [0, 'Time taken cannot be negative'],
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes to speed up leaderboards and query lookups
scoreSchema.index({ category: 1, score: -1, timeTaken: 1 });
scoreSchema.index({ score: -1, timeTaken: 1 });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;