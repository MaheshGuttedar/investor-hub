const Investment = require('../models/Investment');
const Project = require('../models/Project');
const User = require('../models/User');

const create = async (req, res) => {
  const { projectId, amount, userId, date, entity } = req.body;
  if (!projectId || !amount) return res.status(400).json({ error: 'Missing fields' });

  const targetUserId = req.userRole === 'admin' && userId ? userId : req.userId;
  const user = await User.findById(targetUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.userRole !== 'admin' && String(user._id) !== String(req.userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const investment = new Investment({
    user: targetUserId,
    project: projectId,
    amount,
    createdAt: date ? new Date(date) : undefined,
  });
  await investment.save();

  if (req.userRole === 'admin' && entity) {
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { entities: entity } });
  }

  // update project's currentRaised
  await Project.findByIdAndUpdate(projectId, { $inc: { currentRaised: amount } });
  res.status(201).json({ investment });
};

const listForUser = async (req, res) => {
  const items = await Investment.find({ user: req.userId }).populate('project');
  res.json({ investments: items });
};

module.exports = { create, listForUser };
