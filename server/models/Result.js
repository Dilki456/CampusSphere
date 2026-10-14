
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true
    },
    courseCode: {
      type: String,
      required: true
    },
    examName: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
