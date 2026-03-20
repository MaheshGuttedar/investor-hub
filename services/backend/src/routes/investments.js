const express = require('express');
const router = express.Router();
const { create, listForUser } = require('../controllers/investmentController');
const auth = require('../middleware/auth');

router.post('/', auth, create);
router.get('/', auth, listForUser);

module.exports = router;
