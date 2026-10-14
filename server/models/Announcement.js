
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['General', 'Academic', 'Exam', 'Event'],
      default: 'General'
    },
    author: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
