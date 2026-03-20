const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  targetRaise: { type: Number, default: 0 },
  currentRaised: { type: Number, default: 0 },
  targetIrr: { type: Number },
  status: { type: String, enum: ['active','funded','exited'], default: 'active' },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
