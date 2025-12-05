const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  catwayNumber: {
    type: Number,
    required: [true, 'Le numéro de catway est requis'],
    ref: 'Catway'
  },
  clientName: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  boatName: {
    type: String,
    required: [true, 'Le nom du bateau est requis'],
    trim: true,
    minlength: [2, 'Le nom du bateau doit contenir au moins 2 caractères']
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'La date de fin doit être après la date de début'
    }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
reservationSchema.index({ catwayNumber: 1, startDate: 1, endDate: 1 });

// Méthode pour vérifier si une réservation est en cours
reservationSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

module.exports = mongoose.model('Reservation', reservationSchema);