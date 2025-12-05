const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes API
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Récupérer le token depuis le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide'
    });
  }
};

// Middleware pour protéger les pages web
exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware pour rediriger si déjà connecté
exports.redirectIfAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    next();
  }
};