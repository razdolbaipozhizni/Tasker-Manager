// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planned', 'inProgress', 'done'],
    default: 'planned'
  },
  urgent: {
    type: Boolean,
    default: false
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}],
  previousStatus: {
    type: String,
    enum: ['planned', 'inProgress', 'done'],
  },
  // флаг мягкого удаления
  isDeleted: {
    type: Boolean,
    default: false
  },
    // флаг архивирования
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // createdAt, updatedAt
});

module.exports = mongoose.model('Task', taskSchema);
