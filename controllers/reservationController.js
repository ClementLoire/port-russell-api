const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');

// @desc    Récupérer toutes les réservations d'un catway
// @route   GET /api/catways/:id/reservations
// @access  Private
exports.getReservationsByCatway = async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      catwayNumber: req.params.id 
    }).sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Erreur getReservationsByCatway:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

// @desc    Récupérer une réservation spécifique
// @route   GET /api/catways/:id/reservations/:idReservation
// @access  Private
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber: req.params.id
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Erreur getReservationById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation'
    });
  }
};

// @desc    Créer une nouvelle réservation
// @route   POST /api/catways/:id/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const { clientName, boatName, startDate, endDate } = req.body;
    const catwayNumber = parseInt(req.params.id);

    // Validation
    if (!clientName || !boatName || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérifier que le catway existe
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) {
      return res.status(404).json({
        success: false,
        message: 'Catway non trouvé'
      });
    }

    // Vérifier les dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être après la date de début'
      });
    }

    // Vérifier les conflits de réservations
    const conflictingReservation = await Reservation.findOne({
      catwayNumber,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (conflictingReservation) {
      return res.status(400).json({
        success: false,
        message: 'Ce catway est déjà réservé pour cette période'
      });
    }

    const reservation = await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate: start,
      endDate: end
    });

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Erreur createReservation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la réservation'
    });
  }
};

// @desc    Mettre à jour une réservation
// @route   PUT /api/catways/:id/reservations/:idReservation
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    const { clientName, boatName, startDate, endDate } = req.body;

    // Vérifier que la réservation existe
    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber: req.params.id
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier les dates si elles sont modifiées
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'La date de fin doit être après la date de début'
        });
      }

      // Vérifier les conflits
      const conflictingReservation = await Reservation.findOne({
        _id: { $ne: req.params.idReservation },
        catwayNumber: req.params.id,
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      });

      if (conflictingReservation) {
        return res.status(400).json({
          success: false,
          message: 'Conflit avec une autre réservation'
        });
      }
    }

    // Mettre à jour
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.idReservation,
      { clientName, boatName, startDate, endDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    console.error('Erreur updateReservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation'
    });
  }
};

// @desc    Supprimer une réservation
// @route   DELETE /api/catways/:id/reservations/:idReservation
// @access  Private
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({
      _id: req.params.idReservation,
      catwayNumber: req.params.id
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteReservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la réservation'
    });
  }
};

// @desc    Récupérer toutes les réservations (pour le dashboard)
// @route   GET /api/reservations
// @access  Private
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Erreur getAllReservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};