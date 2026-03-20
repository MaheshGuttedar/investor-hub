const mongoose = require('mongoose');

const TaxDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  investingEntity: { type: String, required: true },
  asset: { type: String, default: '--' },
  year: { type: Number, required: true },
  sharedDate: { type: String, required: true },
  projectName: { type: String, required: true },
  url: { type: String, default: '#' },
  isNew: { type: Boolean, default: false },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

module.exports = mongoose.model('TaxDocument', TaxDocumentSchema);
