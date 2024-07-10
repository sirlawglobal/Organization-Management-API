const express = require('express');
const orgController = require('../controllers/orgController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:id', authMiddleware, orgController.getUserById);

module.exports = router;
