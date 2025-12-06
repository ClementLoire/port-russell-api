require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');
const authController = require('./controllers/authController');
const { requireAuth, redirectIfAuth } = require('./middleware/auth');
const Reservation = require('./models/Reservation');
const Catway = require('./models/Catway');
const User = require('./models/User');

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Configuration du moteur de templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes API
app.use('/api/catways', require('./routes/catways'));
app.use('/api/users', require('./routes/users'));
app.use('/', require('./routes/auth'));

// Route pour les réservations (toutes)
const reservationController = require('./controllers/reservationController');
const { protect } = require('./middleware/auth');
app.get('/api/reservations', protect, reservationController.getAllReservations);

// Routes Web
app.get('/', redirectIfAuth, (req, res) => {
  res.render('index');
});

app.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', authController.webLogin);

app.get('/logout', authController.logout);

app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Récupérer les réservations en cours
    const now = new Date();
    const activeReservations = await Reservation.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: 1 });

    res.render('dashboard', {
      user: {
        username: req.session.username,
        email: req.session.email
      },
      activeReservations,
      currentDate: now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/catways', requireAuth, async (req, res) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    res.render('catways', { catways });
  } catch (error) {
    console.error('Erreur catways:', error);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/reservations', requireAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ startDate: -1 });
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    res.render('reservations', { reservations, catways });
  } catch (error) {
    console.error('Erreur reservations:', error);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/users', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.render('users', { users });
  } catch (error) {
    console.error('Erreur users:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Documentation API
app.get('/api-docs', (req, res) => {
  res.render('api-docs');
});

// Route temporaire pour initialiser la base de données (À SUPPRIMER APRÈS USAGE)
app.get('/init-db', async (req, res) => {
  try {
    console.log('🌱 Début de l\'initialisation...');
    
    // Nettoyer les collections
    await User.deleteMany({});
    await Catway.deleteMany({});
    await Reservation.deleteMany({});
    console.log('🗑️  Collections nettoyées');

    // Créer l'utilisateur admin
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@port-russell.fr',
      password: 'admin123'
    });
    console.log('👤 Admin créé');

    // Importer les catways
    const fs = require('fs');
    const path = require('path');
    
    const catwaysData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/catways.json'), 'utf8')
    );
    const catways = await Catway.insertMany(catwaysData);
    console.log(`⚓ ${catways.length} catways importés`);

    // Importer les réservations
    const reservationsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/reservations.json'), 'utf8')
    );
    const reservations = await Reservation.insertMany(reservationsData);
    console.log(`📅 ${reservations.length} réservations importées`);

    res.json({
      success: true,
      message: '✅ Base de données initialisée avec succès !',
      data: {
        admin: {
          email: adminUser.email,
          username: adminUser.username
        },
        stats: {
          catways: catways.length,
          reservations: reservations.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});