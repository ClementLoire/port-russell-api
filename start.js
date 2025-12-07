const { exec } = require('child_process');

console.log('🚀 Vérification de la base de données...');

// Vérifier si on doit seed (première installation)
exec('node scripts/seed.js', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Seed déjà effectué ou erreur:', error.message);
  }
  if (stdout) {
    console.log(stdout);
  }
  if (stderr) {
    console.error(stderr);
  }
  
  // Démarrer le serveur dans tous les cas
  console.log('🚀 Démarrage du serveur...');
  require('./server.js');
});