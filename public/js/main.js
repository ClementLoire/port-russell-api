// Fonctions utilitaires globales

// Formater une date au format français
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Fermer les modals en cliquant en dehors
window.onclick = function(event) {
  const modals = document.getElementsByClassName('modal');
  for (let modal of modals) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  }
}

// Gérer les erreurs réseau
function handleNetworkError(error) {
  console.error('Erreur réseau:', error);
  alert('Erreur de connexion au serveur. Veuillez réessayer.');
}

// Validation de formulaire
function validateForm(formId) {
  const form = document.getElementById(formId);
  return form.checkValidity();
}

console.log('Application Port Russell chargée');