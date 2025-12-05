const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Login utilisateur (API)
// @route   POST /api/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Login utilisateur (Web)
// @route   POST /login
// @access  Public
exports.webLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', {
        error: 'Email et mot de passe requis'
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', {
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Créer une session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur web login:', error);
    res.render('login', {
      error: 'Erreur serveur'
    });
  }
};

// @desc    Logout utilisateur (Web)
// @route   GET /logout
// @access  Private
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur logout:', err);
    }
    res.redirect('/');
  });
};