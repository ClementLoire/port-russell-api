const User = require('../models/User');

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// @desc    Récupérer un utilisateur par email
// @route   GET /api/users/:email
// @access  Private
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getUserByEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
};

// @desc    Créer un nouvel utilisateur
// @route   POST /api/users
// @access  Private
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur createUser:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:email
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    
    // Si le mot de passe est fourni, le hasher
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }
      updateData.password = password;
    }

    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mise à jour manuelle pour déclencher le middleware pre-save
    if (username) user.username = username;
    if (password) user.password = password;
    
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:email
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};