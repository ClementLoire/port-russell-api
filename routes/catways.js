const express = require('express');
const router = express.Router();
const catwayController = require('../controllers/catwayController');
const reservationController = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

// Routes pour les catways
router.get('/', protect, catwayController.getAllCatways);
router.get('/:id', protect, catwayController.getCatwayById);
router.post('/', protect, catwayController.createCatway);
router.put('/:id', protect, catwayController.updateCatway);
router.delete('/:id', protect, catwayController.deleteCatway);

// Routes pour les réservations (sous-ressource de catway)
router.get('/:id/reservations', protect, reservationController.getReservationsByCatway);
router.get('/:id/reservations/:idReservation', protect, reservationController.getReservationById);
router.post('/:id/reservations', protect, reservationController.createReservation);
router.put('/:id/reservations/:idReservation', protect, reservationController.updateReservation);
router.delete('/:id/reservations/:idReservation', protect, reservationController.deleteReservation);

module.exports = router;