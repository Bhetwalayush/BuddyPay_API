const mongoose = require('mongoose');

const StatementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  statement: {
    type: String,
    required: true
  },
  to: {
    type: String, // For example, could be a recipient's name or other information
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Statement = mongoose.model('Statement', StatementSchema);

module.exports = Statement;
