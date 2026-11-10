const mongoose = require('mongoose');

const RecipientDetailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent',
  },
  error: {
    type: String,
    default: null,
  },
  messageId: {
    type: String,
    default: null,
  },
});

const MailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  isHtml: {
    type: Boolean,
    default: true,
  },
  recipients: [
    {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'completed', 'partially_failed', 'failed'],
    default: 'pending',
  },
  totalCount: {
    type: Number,
    required: true,
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
  },
  recipientDetails: [RecipientDetailSchema],
  previewUrl: {
    type: String, // Useful for Ethereal test accounts
    default: null,
  },
  sender: {
    type: String,
    default: 'System',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Mail', MailSchema);

