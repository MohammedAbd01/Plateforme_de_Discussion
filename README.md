# 🎓 Plateforme de Discussion pour Étudiants

<div align="center">
  <img src="https://img.shields.io/badge/Status-En%20développement-yellow" alt="Statut: En développement">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version: 1.0.0">
  <img src="https://img.shields.io/badge/Licence-MIT-green" alt="Licence: MIT">
</div>

<div align="center">
  <h3>Encadré par : Pr. Mme Benaala Hicham</h3>
  <h3>Réalisé par : MOHAMMED ABIDOU</h3>
</div>

## 📋 Aperçu
La Plateforme de Discussion pour Étudiants est une application de chat en temps réel conçue pour permettre aux étudiants de participer à des discussions dans différents salons thématiques. Elle utilise Socket.io pour les communications en temps réel, Express.js comme framework serveur, et MongoDB pour le stockage des données.

## ✨ Fonctionnalités
- **Chat en Temps Réel** : Les utilisateurs peuvent envoyer et recevoir des messages instantanément dans divers salons de discussion.
- **Authentification Sécurisée** : Système robuste d'inscription et de connexion pour les utilisateurs.
- **Stockage des Messages** : Tous les messages sont enregistrés dans une base de données MongoDB, permettant des fonctionnalités de recherche et de récupération.
- **Support Multi-salons** : Les utilisateurs peuvent créer et rejoindre différents salons de discussion selon leurs sujets d'intérêt ou leurs matières.
- **Système de Mentions** : Mentionnez d'autres utilisateurs avec la syntaxe @nom_utilisateur pour attirer leur attention.
- **Notifications** : Recevez des alertes lorsque vous êtes mentionné dans une conversation.
- **Profils Personnalisables** : Modifiez vos informations personnelles et préférences selon vos besoins.

## 🛠️ Technologies Utilisées
- **Backend** : Node.js, Express.js
- **Base de Données** : MongoDB
- **Communication en Temps Réel** : Socket.io
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Authentification** : JSON Web Tokens (JWT)

## 🚀 Installation
1. Clonez le dépôt :
   ```bash
   git clone <url-du-dépôt>
   ```
2. Accédez au répertoire du projet :
   ```bash
   cd plateforme-discussion-etudiants
   ```
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Créez un fichier `.env` basé sur le fichier `.env.example` et configurez vos variables d'environnement.

## 📱 Utilisation
1. Démarrez le serveur :
   ```bash
   npm start
   ```
   Pour le développement, utilisez :
   ```bash
   npm run dev
   ```
2. Ouvrez votre navigateur et accédez à `http://localhost:3000` pour utiliser l'application.

## 🔌 Points d'Accès API
- **Authentification**
  - `POST /api/auth/register` : Inscrire un nouvel utilisateur.
  - `POST /api/auth/login` : Connecter un utilisateur existant.

- **Messages**
  - `POST /api/messages` : Envoyer un nouveau message.
  - `GET /api/messages/:roomId` : Récupérer les messages d'un salon spécifique.

- **Salons**
  - `POST /api/rooms` : Créer un nouveau salon de discussion.
  - `GET /api/rooms` : Récupérer tous les salons de discussion.

## 🧪 Tests
Pour exécuter les tests, utilisez la commande suivante :
```bash
npm test
```

## 🤝 Contribution
Les contributions sont les bienvenues ! N'hésitez pas à soumettre une pull request ou à ouvrir une issue pour toute amélioration ou correction de bugs.

## 📄 Licence
Ce projet est sous licence MIT.

## 📊 Captures d'écran

<div align="center">
  <p><i>Interface de connexion</i></p>
  <!-- Placeholder pour une capture d'écran -->
  <p><i>Salon de discussion</i></p>
  <!-- Placeholder pour une capture d'écran -->
</div>

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à contacter :

- 👨‍🎓 **MOHAMMED ABIDOU** - *Développeur principal* - [Email](mailto:votre-email@example.com)
- 👨‍🏫 **Pr. Mme Benaala Hicham** - *Encadrant du projet*
