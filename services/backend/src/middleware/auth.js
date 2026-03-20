const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Server configuration error' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role entities').lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = String(decoded.id);
    req.userRole = user.role;
    req.userEntities = Array.isArray(user.entities) ? user.entities : [];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
