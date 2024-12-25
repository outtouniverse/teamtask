const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  image: String,
  title: String,
  description: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure this matches the name of your User model
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
