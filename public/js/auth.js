document.addEventListener('DOMContentLoaded', () => {
  // Créer les formulaires de connexion et d'inscription
  creerFormulairesAuth();
  
  // Vérifier si l'utilisateur est déjà connecté
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    connexion(username, token);
  } else {
    afficherFormulaireConnexion();
  }

  const registerForm = document.getElementById('register-form');
    
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission
      
      // Collect form data
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());
      
      // Debugging: Log the form data
      console.log('Form submitted:', data);
      
      // TODO: Add logic to send data to the server or handle registration
    });
  }
});

// Créer les formulaires d'authentification
function creerFormulairesAuth() {
  // Vérifier si les formulaires existent déjà
  if (document.getElementById('login-form') || document.getElementById('register-form')) {
    return; // Empêcher les doublons
  }

  // Créer le conteneur du formulaire de connexion
  const formulaireConnexion = document.createElement('div');
  formulaireConnexion.id = 'login-form';
  formulaireConnexion.classList.add('auth-form');
  formulaireConnexion.innerHTML = `
    <h2><i class="fas fa-sign-in-alt"></i> Connexion</h2>
    <div class="form-group">
      <label for="login-username"><i class="fas fa-user"></i> Nom d'utilisateur</label>
      <input type="text" id="login-username" placeholder="Entrez votre nom d'utilisateur" />
    </div>
    <div class="form-group">
      <label for="login-password"><i class="fas fa-lock"></i> Mot de passe</label>
      <input type="password" id="login-password" placeholder="Entrez votre mot de passe" />
    </div>
    <button id="login-button">Se connecter</button>
    <p class="form-switch">Pas encore inscrit ? <a href="#register">Créer un compte</a></p>
  `;
  
  // Créer le conteneur du formulaire d'inscription
  const formulaireInscription = document.createElement('div');
  formulaireInscription.id = 'register-form';
  formulaireInscription.classList.add('auth-form');
  formulaireInscription.innerHTML = `
    <h2><i class="fas fa-user-plus"></i> Créer un compte</h2>
    <div class="form-group">
      <label for="register-username"><i class="fas fa-user"></i> Nom d'utilisateur*</label>
      <input type="text" id="register-username" placeholder="Choisissez un nom d'utilisateur" required />
    </div>
    <div class="form-group">
      <label for="register-password"><i class="fas fa-lock"></i> Mot de passe*</label>
      <input type="password" id="register-password" placeholder="Choisissez un mot de passe" required />
    </div>
    <div class="form-group">
      <label for="register-firstname"><i class="fas fa-id-card"></i> Prénom*</label>
      <input type="text" id="register-firstname" placeholder="Votre prénom" required />
    </div>
    <div class="form-group">
      <label for="register-lastname"><i class="fas fa-id-card"></i> Nom*</label>
      <input type="text" id="register-lastname" placeholder="Votre nom" required />
    </div>
    <div class="form-group">
      <label for="register-age"><i class="fas fa-birthday-cake"></i> Âge*</label>
      <input type="number" id="register-age" placeholder="Votre âge" required min="16" max="100" />
    </div>
    <div class="form-group">
      <label for="register-email"><i class="fas fa-envelope"></i> Email*</label>
      <input type="email" id="register-email" placeholder="Votre email" required />
    </div>
    <button id="register-button">Créer un compte</button>
    <p class="form-switch">Déjà inscrit ? <a href="#login">Se connecter</a></p>
  `;
  
  // Créer l'éditeur de profil
  const editeurProfil = document.createElement('div');
  editeurProfil.id = 'profile-editor';
  editeurProfil.classList.add('auth-form');
  editeurProfil.innerHTML = `
    <h2><i class="fas fa-user-edit"></i> Modifier le profil</h2>
    <div class="form-group">
      <label for="profile-firstname"><i class="fas fa-id-card"></i> Prénom</label>
      <input type="text" id="profile-firstname" placeholder="Votre prénom" />
    </div>
    <div class="form-group">
      <label for="profile-lastname"><i class="fas fa-id-card"></i> Nom</label>
      <input type="text" id="profile-lastname" placeholder="Votre nom" />
    </div>
    <div class="form-group">
      <label for="profile-age"><i class="fas fa-birthday-cake"></i> Âge</label>
      <input type="number" id="profile-age" placeholder="Votre âge" min="16" max="100" />
    </div>
    <div class="form-group">
      <label for="profile-email"><i class="fas fa-envelope"></i> Email</label>
      <input type="email" id="profile-email" placeholder="Votre email" />
    </div>
    <button id="save-profile">Enregistrer les modifications</button>
    <button id="cancel-profile" class="secondary">Annuler</button>
  `;
  
  // Ajouter les formulaires à la page
  document.querySelector('main').prepend(editeurProfil);
  document.querySelector('main').prepend(formulaireInscription);
  document.querySelector('main').prepend(formulaireConnexion);
  
  // Les masquer initialement
  formulaireConnexion.style.display = 'none';
  formulaireInscription.style.display = 'none';
  editeurProfil.style.display = 'none';
  
  // Ajouter des écouteurs d'événements pour la connexion
  document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (username && password) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          connexion(data.username, data.token);
        } else {
          alert(data.message || 'Échec de la connexion');
        }
      } catch (error) {
        alert('Erreur lors de la connexion. Veuillez réessayer.');
      }
    }
  });
  
  // Ajouter des écouteurs d'événements pour l'inscription
  document.getElementById('register-button').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const firstName = document.getElementById('register-firstname').value.trim();
    const lastName = document.getElementById('register-lastname').value.trim();
    const age = parseInt(document.getElementById('register-age').value);
    const email = document.getElementById('register-email').value.trim();
    
    if (username && password && firstName && lastName && age && email) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            username, 
            password,
            firstName,
            lastName,
            age,
            email
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          connexion(data.username, data.token);
        } else {
          alert(data.message || 'Échec de l\'inscription');
        }
      } catch (error) {
        alert('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  });
  
  // Ajouter des écouteurs d'événements pour l'éditeur de profil
  document.getElementById('save-profile').addEventListener('click', async () => {
    const firstName = document.getElementById('profile-firstname').value.trim();
    const lastName = document.getElementById('profile-lastname').value.trim();
    const age = parseInt(document.getElementById('profile-age').value);
    const email = document.getElementById('profile-email').value.trim();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          age,
          email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Profil mis à jour avec succès');
        masquerEditeurProfil();
      } else {
        alert(data.message || 'Échec de la mise à jour du profil');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
    }
  });
  
  document.getElementById('cancel-profile').addEventListener('click', masquerEditeurProfil);
  
  // Liens de navigation
  document.querySelector('a[href="#login"]').addEventListener('click', (e) => {
    e.preventDefault();
    afficherFormulaireConnexion();
  });
  
  document.querySelector('a[href="#register"]').addEventListener('click', (e) => {
    e.preventDefault();
    afficherFormulaireInscription();
  });
  
  // Ajouter un lien dans l'en-tête pour la modification du profil
  const navList = document.querySelector('header nav ul');
  const profileLink = document.createElement('li');
  profileLink.innerHTML = '<a href="#profile" id="edit-profile-link">Modifier le profil</a>';
  profileLink.style.display = 'none'; // Masquer initialement
  navList.appendChild(profileLink);
  
  document.getElementById('edit-profile-link').addEventListener('click', (e) => {
    e.preventDefault();
    afficherEditeurProfil();
  });
}

function afficherFormulaireConnexion() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'none';
  document.getElementById('chat').style.display = 'none';
}

function afficherFormulaireInscription() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'none';
  document.getElementById('chat').style.display = 'none';
}

function afficherEditeurProfil() {
  chargerProfilUtilisateur();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('profile-editor').style.display = 'block';
  document.getElementById('chat-room').style.display = 'none';
  document.getElementById('chat').style.display = 'none';
}

function masquerEditeurProfil() {
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'block';
  document.getElementById('chat').style.display = 'block';
}

async function chargerProfilUtilisateur() {
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      document.getElementById('profile-firstname').value = user.firstName;
      document.getElementById('profile-lastname').value = user.lastName;
      document.getElementById('profile-age').value = user.age;
      document.getElementById('profile-email').value = user.email;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil :', error);
  }
}

function connexion(username, token) {
  // Mettre à jour la variable globale username dans chat.js
  window.setUsername(username);  // Utiliser la nouvelle fonction setter
  
  // Informer le serveur que l'utilisateur s'est connecté avec le token
  socket.emit('login', { username, token });
  
  // Afficher l'interface de chat
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'block';
  document.getElementById('chat').style.display = 'block';
  
  // Afficher les liens de déconnexion et de profil
  document.querySelector('a[href="#login"]').parentElement.style.display = 'none';
  document.querySelector('a[href="#register"]').parentElement.style.display = 'none';
  document.getElementById('edit-profile-link').parentElement.style.display = 'block';
  
  // Ajouter un lien de déconnexion
  const navList = document.querySelector('header nav ul');
  let logoutLink = document.getElementById('logout-link');
  if (!logoutLink) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#logout" id="logout-link">Se déconnecter</a>';
    navList.appendChild(li);
    
    document.getElementById('logout-link').addEventListener('click', (e) => {
      e.preventDefault();
      deconnexion();
    });
  } else {
    logoutLink.parentElement.style.display = 'block';
  }
}

function deconnexion() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.username = '';
  
  // Masquer les liens de profil et de déconnexion
  document.getElementById('edit-profile-link').parentElement.style.display = 'none';
  document.getElementById('logout-link').parentElement.style.display = 'none';
  
  // Afficher les liens de connexion et d'inscription
  document.querySelector('a[href="#login"]').parentElement.style.display = 'block';
  document.querySelector('a[href="#register"]').parentElement.style.display = 'block';
  
  afficherFormulaireConnexion();
}