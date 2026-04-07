const mongoose = require('mongoose');

const translationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sourceText: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true
  },
  sourceLang: {
    type: String,
    required: true
  },
  targetLang: {
    type: String,
    required: true
  },
  translationType: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for faster queries
translationHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TranslationHistory', translationHistorySchema);