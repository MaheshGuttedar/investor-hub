const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  investmentName: { type: String, default: '' },
  projectName: { type: String, required: true },
  type: { type: String, enum: ['investment', 'distribution', 'return'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'pending', 'processing'], default: 'completed' },
  entity: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
