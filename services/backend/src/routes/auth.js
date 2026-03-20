const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, me, listPendingUsers, listUsers, approveUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', auth, me);
router.get('/users', auth, admin, listUsers);
router.get('/pending-users', auth, admin, listPendingUsers);
router.patch('/users/:id/approve', auth, admin, approveUser);

module.exports = router;
