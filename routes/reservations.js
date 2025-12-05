const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

// Note : Ce fichier est optionnel car les routes sont déjà dans catways.js
// Vous pouvez l'utiliser si vous voulez une organisation différente

// Route pour obtenir toutes les réservations (pas liées à un catway spécifique)
router.get('/', protect, reservationController.getAllReservations);

module.exports = router;