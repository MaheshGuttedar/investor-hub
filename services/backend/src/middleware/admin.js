const User = require('../models/User');

module.exports = async (req, res, next) => {
  const user = await User.findById(req.userId).select('role');
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.currentUser = user;
  next();
};
