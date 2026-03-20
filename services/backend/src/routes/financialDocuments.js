const express = require('express');
const router = express.Router();
const { list, create } = require('../controllers/financialDocumentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, list);
router.post('/', auth, admin, create);

module.exports = router;
