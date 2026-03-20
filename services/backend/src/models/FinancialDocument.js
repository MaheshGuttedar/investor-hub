const mongoose = require('mongoose');

const FinancialDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  investingEntity: { type: String, required: true },
  asset: { type: String, default: '--' },
  category: { type: String, default: 'General' },
  year: { type: Number, required: true },
  sharedDate: { type: String, required: true },
  projectName: { type: String, required: true },
  url: { type: String, default: '#' },
}, { timestamps: true });

module.exports = mongoose.model('FinancialDocument', FinancialDocumentSchema);
