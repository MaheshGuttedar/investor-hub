const express = require('express');
const router = express.Router();
const { list, getOne, create, update, remove } = require('../controllers/projectController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, list);
router.get('/:id', auth, getOne);
router.post('/', auth, admin, create);
router.put('/:id', auth, admin, update);
router.delete('/:id', auth, admin, remove);

module.exports = router;
