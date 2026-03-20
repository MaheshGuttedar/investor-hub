const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendApprovalEmail } = require('../services/emailService');

const serializeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  entities: Array.isArray(user.entities) ? user.entities : [],
  isApproved: user.isApproved !== false,
  approvedAt: user.approvedAt,
});

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = new User({ name, email, phone, password, isApproved: false });
    await user.save();
    res.status(201).json({
      message: 'Signup successful. Your account is pending admin approval.',
      user: serializeUser({ ...user.toObject(), isApproved: false })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.isApproved === false) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const me = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json({ user: user ? serializeUser(user) : null });
};

const listPendingUsers = async (_req, res) => {
  const users = await User.find({ isApproved: false }).select('-password').sort({ createdAt: -1 });
  res.json({ users: users.map(serializeUser) });
};

const listUsers = async (_req, res) => {
  const users = await User.find({ role: 'user', isApproved: true })
    .select('-password')
    .sort({ name: 1, createdAt: -1 });
  res.json({ users: users.map(serializeUser) });
};

const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Send email FIRST — only approve in DB if it succeeds
  try {
    await sendApprovalEmail({ email: user.email, name: user.name });
  } catch (err) {
    console.error('Approval email failed', err);
    const emailError = err instanceof Error ? err.message : String(err);
    return res.status(502).json({
      error: 'Approval email could not be sent. User was NOT approved.',
      emailError,
    });
  }

  user.isApproved = true;
  user.approvedAt = new Date();
  await user.save();

  res.json({
    message: 'User approved successfully and email sent',
    emailSent: true,
    user: serializeUser(user),
  });
};

module.exports = { register, login, me, listPendingUsers, listUsers, approveUser };
