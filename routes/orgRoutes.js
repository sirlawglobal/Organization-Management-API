const express = require('express');
const orgController = require('../controllers/orgController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, orgController.createOrganisation);

router.get('/', authMiddleware, orgController.getUserOrganisations);

router.get('/:orgId', authMiddleware, orgController.getOrganisationById);

router.post('/:orgId/users', authMiddleware, orgController.addUserToOrganisation);

module.exports = router;
