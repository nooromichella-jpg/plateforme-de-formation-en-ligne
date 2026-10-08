SkillHub - Plateforme de Formation en Ligne & Tuteur IA
![Image](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Image](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Image](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Image](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)
![Image](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?logo=google&logoColor=white)
![Image](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![Image](https://img.shields.io/badge/License-MIT-green.svg)
SkillHub est une plateforme d'apprentissage en ligne moderne, performante et complète conçue pour l'acquisition de compétences technologiques et professionnelles (Intelligence Artificielle, Développement Web, DevOps, Data Science, UI/UX Design).
Elle intègre un tuteur pédagogique intelligent (SkillBot) propulsé par l'API Google Gemini, une gestion complète des inscriptions et de la progression des apprenants, un système de paiement adapté aux réalités locales (Mobile Money : MVola, Orange Money, Airtel Money en Ariary MGA), ainsi qu'un tableau de bord d'administration avancé pour piloter le catalogue et les métriques de formation.

🧑‍🎓 Espace Apprenant
Catalogue de Formations Interactif : Recherche instantanée, filtrage par catégorie (Développement, IA, DevOps, Design, etc.), par niveau (Débutant, Intermédiaire, Avancé) et par prix (Gratuit / Payant).
Lecteur de Cours Immersif :
Lecteur vidéo plein écran avec liste des modules et chapitres.
Suivi de la progression en temps réel (% achevé, leçons validées).
Gestion des états de lecture et reprise automatique là où l'étudiant s'est arrêté.
Quiz de Validation par Module : Questions à choix multiples, explications didactiques immédiates, calcul du score et déblocage de la progression.
Certificats de Réussite Numériques : Génération automatique d'un certificat nominatif officiel avec date, note et signature dès complétion à 100% de la formation, exportable ou imprimable.
Espace Personnel (« Mon apprentissage ») : Vue d'ensemble de tous les cours rejoints, cours favoris/sauvegardés et historique d'avancement.
Page d'Inscription des Étudiants : Formulaire dédié permettant une inscription simple avec sélection directe de la formation et du mode de règlement.

🤖 Tuteur Virtuel IA (SkillBot)
Intégré directement dans l'interface et dans le lecteur de cours.
Explique les concepts de la leçon courante en temps réel.
Aide l'étudiant à résoudre ses blocages sans donner directement les réponses aux quiz.
Cascade de résilience multi-modèles (gemini-3.8-flash, gemini-flash-latest, gemini-3.1-flash-lite) avec secours contextuel instantané en cas de pic de charge réseau.

💳 Paiements Flexibles
Support complet de la devise locale Ariary (MGA) avec conversion et affichage clair.
Intégration et simulation des flux Mobile Money :
🟢 MVola (Telma)
🟠 Orange Money
🔴 Airtel Money
Possibilité d'accéder directement aux cours gratuits sans étape de paiement.

🛠️ Espace Administration (Admin Portal)
Accessible aux comptes autorisés via Firebase Auth.
Tableau de Bord & Statistiques (Chart.js) :
Chiffre d'affaires global et mensuel.
Taux de complétion et nombre d'inscriptions actives.
Graphiques de répartition par catégorie et cours les plus populaires.
Gestion CRUD Complète des Formations :
Création de nouvelles formations avec modale optimisée (gestion des métadonnées, modules, leçons, vidéos, quiz et vignettes prédéfinies ou personnalisées).
Modification instantanée et suppression sécurisée avec boîte de dialogue de confirmation.
Bouton de Seeding automatique pour injecter le catalogue officiel par défaut en un clic.

🌓 Expérience Utilisateur & Design
Mode Sombre / Mode Clair fluide avec persistance de préférence.
Palette de couleurs moderne (Dark obsidian #090A0F, reflets indigo/violet, contrastes élevés).
Animations fluides via motion/react.
Design 100% responsive adapté aux mobiles, tablettes et écrans larges.

🛠️ Stack Technique
Domaine	Technologies
Frontend	React 19, TypeScript, Vite 8
Styling & UI	Tailwind CSS v4, Motion, Lucide React (icônes)
Graphiques & Data	Chart.js & react-chartjs-2
Backend & Serveur	Express, Node.js, tsx
Intelligence Artificielle	Google GenAI SDK (@google/genai) (Gemini 3.8 Flash)
Base de Données & Auth	Firebase (Cloud Firestore & Firebase Authentication)

📂 Architecture du Projet
code
Text
├── .env.example                 # Modèle des variables d'environnement
├── firebase-applet-config.json  # Configuration des identifiants client Firebase
├── firebase-blueprint.json      # Schéma de modélisation des collections Firestore
├── firestore.rules              # Règles de sécurité Cloud Firestore (RBAC & permissions)
├── index.html                   # Point d'entrée HTML de l'application
├── package.json                 # Dépendances et scripts npm
├── server.ts                    # Serveur Express fullstack (Proxy IA Gemini, API Chat)
├── tsconfig.json                # Configuration TypeScript
├── vite.config.ts               # Configuration Vite et plugins React / Tailwind
│
├── public/                      # Fichiers statiques et médias
│
└── src/
    ├── main.tsx                 # Point de montage de l'application React
    ├── App.tsx                  # Composant racine, routage, gestion d'état globale
    ├── index.css                # Styles globaux et imports Tailwind CSS v4
    │
    ├── components/              # Composants UI modulaires
    │   ├── AIChatbot.tsx                # Widget du tuteur IA SkillBot
    │   ├── AdminPortal.tsx              # Panneau d'administration & gestion des formations
    │   ├── AdminStatsCharts.tsx         # Graphiques analytiques (Chart.js)
    │   ├── AuthModal.tsx                # Modale de connexion / inscription (Email & Google)
    │   ├── CertificateModal.tsx         # Modale d'affichage & téléchargement du certificat
    │   ├── ChapterQuizModal.tsx         # Modale interactive de passage de quiz
    │   ├── CourseCard.tsx               # Carte de présentation d'une formation
    │   ├── CoursePlayerView.tsx         # Lecteur vidéo immersif et suivi des leçons
    │   ├── EnrollmentPaymentModal.tsx   # Modale de paiement (Mobile Money & Carte)
    │   ├── Layout.tsx                   # En-tête de navigation, pied de page, thème
    │   ├── StudentRegistrationPage.tsx  # Page dédiée d'inscription des étudiants
    │   └── ToastContainer.tsx           # Notifications toasts animées
    │
    ├── lib/                     # Utilitaires et connecteurs
    │   ├── chatbotKnowledge.ts          # Base de connaissances locale du tuteur SkillBot
    │   ├── coursesData.ts               # Catalogue par défaut & modules pédagogiques
    │   ├── currency.ts                  # Formatage et conversion des prix (Ariary MGA)
    │   └── firebase.ts                  # Initialisation Singleton du SDK Firebase (Auth & Firestore)
    │
    └── types/
        └── index.ts                     # Interfaces TypeScript (Course, Lesson, Quiz, Enrollment...)
        
🚀 Prérequis & Installation
1. Prérequis
Node.js version 20 ou supérieure installée (Télécharger Node.js).
npm (inclus avec Node.js) ou bun / yarn / pnpm.
Une clé d'API Google Gemini (Obtenir sur Google AI Studio).
(Optionnel) Un projet Firebase si vous souhaitez connecter votre propre instance Cloud Firestore.

3. Cloner le Dépôt
code
Bash
git clone https://github.com/votre-utilisateur/skillhub-platform.git
cd skillhub-platform
4. Installer les Dépendances
code
Bash
npm install

🔐 Variables d'Environnement
Créez un fichier .env à la racine du projet en vous basant sur .env.example :
code
Bash
cp .env.example .env
Renseignez vos clés dans le fichier .env :
code
Env
# Clé API Google Gemini (Requise pour le tuteur IA SkillBot)
GEMINI_API_KEY="AIzaSy..."

# URL de l'application (en local ou sur votre serveur)
APP_URL="http://localhost:3000"

# Port du serveur (optionnel, 3000 par défaut)
PORT=3000
Note de sécurité : La clé GEMINI_API_KEY reste exclusivement côté serveur dans server.ts et n'est jamais exposée dans le bundle client du navigateur.

💻 Commandes Disponibles
Commande	Action
npm run dev	Lance le serveur Express et l'environnement de développement Vite avec rechargement à chaud (HMR).
npm run build	Compile l'application cliente optimisée dans le dossier dist/.
npm run start	Démarre le serveur Node.js en mode production.
npm run preview	Prévisualise localement le build de production généré par Vite.
npm run lint	Lance la vérification stricte des types TypeScript via tsc --noEmit.
npm run clean	Supprime les répertoires et fichiers de build temporaires (dist).
Démarrer en mode développement :
code
Bash
npm run dev
Ouvrez ensuite votre navigateur sur http://localhost:3000.

🗄️ Base de Données & Sécurité Firebase
L'application utilise Cloud Firestore avec un modèle orienté documents :
Modèle de Données
courses/{courseId} : Formations, instructeurs, métadonnées, modules, leçons et quiz associés.
enrollments/{enrollmentId} : Inscriptions d'un étudiant (userId, courseId, progress, completedLessonIds, status, certificateIssued).
favorites/{favoriteId} : Formations enregistrées par un utilisateur dans ses favoris.
contacts/{contactId} : Messages et demandes d'informations envoyés depuis le formulaire de contact.
Règles de Sécurité (firestore.rules)
Les règles de sécurité Firestore appliquent le principe du moindre privilège :
Les cours (courses) sont accessibles en lecture publique pour le catalogue.
Les inscriptions (enrollments) et favoris (favorites) sont strictement restreints au propriétaire (request.auth.uid == resource.data.userId) ou aux administrateurs.
Seuls les administrateurs authentifiés peuvent modifier ou supprimer des formations et consulter les messages de contact.

🤖 Assistant IA & Tuteur Pédagogique (SkillBot)
Le widget SkillBot propose un accompagnement personnalisé en continu :
Requêtes Sécurisées : Le client communique avec l'endpoint d'API backend POST /api/chat.
Contextualisation Pédagogique : Le serveur injecte le cours, le module et la leçon actuellement visualisés par l'étudiant dans le prompt système.
Haute Disponibilité & Tolérance aux Pannes :
En cas d'indisponibilité transitoire d'un modèle (erreur 503 ou quota 429), le serveur bascule automatiquement sur les modèles candidats alternatifs (gemini-3.8-flash, gemini-flash-latest, gemini-3.1-flash-lite).
Si tous les réseaux externes sont inaccessibles, une réponse didactique de secours basée sur une base de connaissances locale (chatbotKnowledge.ts) prend le relais sans bloquer l'expérience utilisateur.

💰 Système de Paiement & Mobile Money
SkillHub est spécialement adapté aux méthodes de paiement utilisées à Madagascar et en Afrique francophone :
Tous les montants sont gérés en Ariary (MGA) avec formatage monétaire dédié (ex. : 250 000 Ar).
Simulation des flux Mobile Money :
MVola (Numéros au format 034 XX XXX XX ou 038 XX XXX XX)
Orange Money (Numéros au format 032 XX XXX XX ou 037 XX XXX XX)
Airtel Money (Numéros au format 033 XX XXX XX)
Validation du numéro de téléphone, confirmation sécurisée et inscription instantanée à la formation.

🛡️ Portail Administrateur
Pour accéder au portail d'administration :
Connectez-vous avec une adresse email d'administration ou autorisée dans firestore.rules.
Cliquez sur l'onglet « Administration » dans la barre de navigation.
Vous accédez à :
La vue globale des métriques (chiffre d'affaires, inscrits, taux de satisfaction).
Les graphiques interactifs des performances d'apprentissage.
Le bouton « Réinitialiser les cours officiels » (injecte automatiquement 6 cours complets avec leçons vidéo et quiz).
Le bouton « Nouvelle Formation » pour concevoir et publier un nouveau programme éducatif.

🌐 Déploiement en Production
Déploiement via Docker ou Conteneur (Cloud Run, Render, VPS)
L'application inclut un serveur Express unique capable de servir à la fois l'API et les fichiers statiques construits par Vite :
code
Bash
# 1. Compiler le frontend
npm run build

# 2. Lancer le serveur Node
NODE_ENV=production npm start
Exemple de Dockerfile
code
Dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

