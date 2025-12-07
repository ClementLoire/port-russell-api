require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seed...');

    // Nettoyer les collections existantes
    await User.deleteMany({});
    await Catway.deleteMany({});
    await Reservation.deleteMany({});
    console.log('🗑️  Collections nettoyées');

    // Créer un utilisateur administrateur par défaut
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@port-russell.fr',
      password: 'admin123' // Sera hashé automatiquement
    });
    console.log('👤 Utilisateur admin créé:', adminUser.email);

    // Importer les catways
    const catwaysPath = path.join(__dirname, '../data/catways.json');
    if (fs.existsSync(catwaysPath)) {
      const catwaysData = JSON.parse(fs.readFileSync(catwaysPath, 'utf8'));
      const catways = await Catway.insertMany(catwaysData);
      console.log(`⚓ ${catways.length} catways importés`);
    } else {
      console.log('⚠️  Fichier catways.json introuvable');
    }

    // Importer les réservations
    const reservationsPath = path.join(__dirname, '../data/reservations.json');
    if (fs.existsSync(reservationsPath)) {
      const reservationsData = JSON.parse(fs.readFileSync(reservationsPath, 'utf8'));
      const reservations = await Reservation.insertMany(reservationsData);
      console.log(`📅 ${reservations.length} réservations importées`);
    } else {
      console.log('⚠️  Fichier reservations.json introuvable');
    }

    console.log('✅ Seed terminé avec succès!');
    console.log('\n📋 Informations de connexion:');
    console.log('Email: admin@port-russell.fr');
    console.log('Mot de passe: admin123');
    console.log('\n🚀 Vous pouvez maintenant lancer le serveur avec: npm run dev');

    // Fermer la connexion proprement
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Exécuter le seed
connectDB().then(seedDatabase);