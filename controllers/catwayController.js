const Catway = require('../models/Catway');

// @desc    Récupérer tous les catways
// @route   GET /api/catways
// @access  Private
exports.getAllCatways = async (req, res) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: catways.length,
      data: catways
    });
  } catch (error) {
    console.error('Erreur getAllCatways:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catways'
    });
  }
};

// @desc    Récupérer un catway par son numéro
// @route   GET /api/catways/:id
// @access  Private
exports.getCatwayById = async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id });
    
    if (!catway) {
      return res.status(404).json({
        success: false,
        message: 'Catway non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: catway
    });
  } catch (error) {
    console.error('Erreur getCatwayById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du catway'
    });
  }
};

// @desc    Créer un nouveau catway
// @route   POST /api/catways
// @access  Private
exports.createCatway = async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;

    // Validation
    if (!catwayNumber || !catwayType) {
      return res.status(400).json({
        success: false,
        message: 'Numéro et type de catway requis'
      });
    }

    // Vérifier si le catway existe déjà
    const existingCatway = await Catway.findOne({ catwayNumber });
    if (existingCatway) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de catway existe déjà'
      });
    }

    const catway = await Catway.create({
      catwayNumber,
      catwayType,
      catwayState: catwayState || 'bon état'
    });

    res.status(201).json({
      success: true,
      data: catway
    });
  } catch (error) {
    console.error('Erreur createCatway:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du catway'
    });
  }
};

// @desc    Mettre à jour un catway
// @route   PUT /api/catways/:id
// @access  Private
exports.updateCatway = async (req, res) => {
  try {
    const { catwayState } = req.body;

    // Vérifier que seul l'état est modifié
    if (req.body.catwayNumber || req.body.catwayType) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro et le type ne peuvent pas être modifiés'
      });
    }

    if (!catwayState) {
      return res.status(400).json({
        success: false,
        message: 'L\'état du catway est requis'
      });
    }

    const catway = await Catway.findOneAndUpdate(
      { catwayNumber: req.params.id },
      { catwayState },
      { new: true, runValidators: true }
    );

    if (!catway) {
      return res.status(404).json({
        success: false,
        message: 'Catway non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: catway
    });
  } catch (error) {
    console.error('Erreur updateCatway:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du catway'
    });
  }
};

// @desc    Supprimer un catway
// @route   DELETE /api/catways/:id
// @access  Private
exports.deleteCatway = async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({
        success: false,
        message: 'Catway non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Catway supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteCatway:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du catway'
    });
  }
};