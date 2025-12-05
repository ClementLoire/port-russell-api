const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour l'API
router.post('/api/login', authController.login);

module.exports = router;