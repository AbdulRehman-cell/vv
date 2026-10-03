const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category slug or name is required'],
      trim: true,
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: 'Options must contain at least 2 answers.'
      }
    },
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: [0, 'Correct option index cannot be negative'],
      default: 0
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty'
      },
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

// Compatibility virtual for any code expecting options as a raw/serialized field or optionsArray
questionSchema.virtual('optionsArray').get(function() {
  return this.options || [];
});

// Ensure virtuals are serialized
questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);