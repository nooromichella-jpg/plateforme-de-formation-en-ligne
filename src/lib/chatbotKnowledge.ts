/**
 * Moteur de connaissances et réponses instantanées pour SkillBot.
 * Permet une réponse immédiate (< 100ms) pour garantir une expérience utilisateur fluide sans latence réseau.
 */

export interface CourseChatContext {
  courseTitle?: string;
  currentModuleTitle?: string;
  currentLessonTitle?: string;
}

export function getInstantKnowledgeResponse(
  userQuery: string,
  courseContext?: CourseChatContext
): string {
  const q = userQuery.toLowerCase().trim();

  // 1. Débuter dans le développement web (Question phare du chatbot)
  if (
    q.includes('débuter') || 
    q.includes('debuter') || 
    q.includes('par quoi commencer') || 
    q.includes('devenir développeur') || 
    q.includes('devenir developpeur') || 
    q.includes('commencer le code')
  ) {
    return `### 🚀 Roadmap conseillée pour devenir Développeur Web

Pour construire des bases solides et trouver des opportunités professionnelles, voici le parcours idéal recommandé par nos formateurs :

1. **Étape 1 : Les Fondations (100% Gratuit)**
   Suivez notre formation **Initiation Gratuite au Développement Web** (*HTML5, CSS3, JavaScript moderne*). Vous comprendrez comment fonctionne le web et construirez vos premières pages interactives.

2. **Étape 2 : Le Framework moderne le plus demandé**
   Enchaînez avec **Next.js 15 & React 19 : Le Guide Complet Fullstack** (250 000 Ar). Vous apprendrez à développer des applications web professionnelles complètes avec Server Actions et bases de données.

3. **Étape 3 : Déploiement & Bonnes pratiques**
   Complétez avec **Docker & Kubernetes : Déploiement Cloud et DevOps** pour savoir mettre en ligne vos projets comme en entreprise.

💡 *Astuce : Vous pouvez vous inscrire directement via l'onglet **« Inscription »** et démarrer le cours gratuit dès aujourd'hui !*`;
  }

  // 2. Localisation des cours après inscription
  if (
    q.includes('où') || 
    q.includes('ou voir') || 
    q.includes('retrouver') || 
    q.includes('mes cours') || 
    q.includes('mes formations') || 
    q.includes('mon espace') || 
    q.includes('après inscription') || 
    q.includes('apres inscription') || 
    q.includes('retrouve')
  ) {
    return `### 🎓 Où retrouver vos cours après inscription ?

Dès que votre inscription est enregistrée, vos formations sont disponibles en accès immédiat dans votre espace personnel :

👉 Cliquez sur l'onglet **« Mon espace d'apprentissage »** situé dans la barre de navigation en haut de l'écran.

Dans cet espace, vous pouvez :
- Reprendre vos leçons vidéo là où vous vous étiez arrêté.
- Suivre votre jauge de progression en pourcentage (%).
- Passer les **mini-quiz interactifs** à la fin de chaque chapitre.
- Télécharger votre **certificat officiel personnalisé** dès que vous atteignez 100% !`;
  }

  // 3. Formations et Tarifs officiels
  if (
    q.includes('tarif') || 
    q.includes('prix') || 
    q.includes('combien') || 
    q.includes('formation disponible') || 
    q.includes('catalogue') || 
    q.includes('coût') || 
    q.includes('cout')
  ) {
    return `### 📚 Nos formations certifiantes & tarifs officiels

Voici la grille complète de nos cursus disponibles sur SkillHub :

| Formation | Niveau | Durée | Tarif |
| :--- | :--- | :--- | :--- |
| **Initiation au Dév Web (HTML, CSS, JS)** | Débutant | 4h | **Gratuit (0 Ar)** |
| **Next.js 15 & React 19 Fullstack** | Intermédiaire | 12h | **250 000 Ar** |
| **Python : Data Science & Machine Learning** | Tous niveaux | 18h | **225 000 Ar** |
| **Docker & Kubernetes : DevOps & Cloud** | Intermédiaire | 11h | **275 000 Ar** |
| **Développement d'Agents IA & LangChain** | Avancé | 15h | **300 000 Ar** |
| **UI/UX Design Moderne avec Figma** | Débutant | 9h | **200 000 Ar** |

💳 Paiements acceptés en toute sécurité par **Mobile Money** (*MVola, Orange Money, Airtel Money*) via l'onglet **« Inscription »**.`;
  }

  // 4. Modalités d'obtention du certificat
  if (
    q.includes('certificat') || 
    q.includes('diplôme') || 
    q.includes('diplome') || 
    q.includes('attestation') || 
    q.includes('certification')
  ) {
    return `### 🏆 Comment obtenir votre Certificat SkillHub ?

Nos certificats sont officiels, nominatifs et vérifiables pour enrichir votre CV et votre profil LinkedIn :

1. **Complétez 100% des leçons** : regardez les vidéos de chaque module du cours.
2. **Validez les mini-QCM** : réussissez les quiz de validation à la fin de chaque chapitre (score minimum 70%).
3. **Téléchargement immédiat** : dès que votre progression atteint **100%**, un bouton doré **« Télécharger mon certificat »** apparaît dans le lecteur et dans votre espace d'apprentissage.

Le certificat comprend votre nom complet, l'intitulé du cursus, la date de validation et votre identifiant d'accréditation unique !`;
  }

  // 5. Inscription & Paiement Mobile Money
  if (
    q.includes('inscription') || 
    q.includes('inscrire') || 
    q.includes('payer') || 
    q.includes('paiement') || 
    q.includes('mvola') || 
    q.includes('orange money') || 
    q.includes('airtel')
  ) {
    return `### 💳 Comment s'inscrire et régler sa formation ?

L'inscription se fait en 2 minutes en toute simplicité :

1. Ouvrez l'onglet **« Inscription »** dans le menu supérieur.
2. Sélectionnez le cours de votre choix.
3. Renseignez votre nom, email et numéro de téléphone.
4. Pour les cours payants, choisissez votre opérateur favori :
   - **MVola**
   - **Orange Money**
   - **Airtel Money**
5. Confirmez la transaction pour débloquer immédiatement l'accès au cours dans **« Mon espace d'apprentissage »** !`;
  }

  // 6. Contexte de cours actif (pendant la lecture d'une leçon)
  if (courseContext?.courseTitle) {
    if (q.includes('quiz') || q.includes('qcm') || q.includes('valider')) {
      return `### 🎯 Conseils pour réussir le Quiz : ${courseContext.currentModuleTitle || courseContext.courseTitle}

- **Prenez le temps de relire** : Les questions testent les bonnes pratiques vues dans la vidéo.
- **Droit à l'erreur** : Si votre score est inférieur à 70%, vous pouvez réviser et retenter le quiz à tout moment.
- **Impact direct** : Chaque quiz réussi augmente votre pourcentage global vers l'obtention du certificat !`;
    }

    if (q.includes('résumé') || q.includes('resume') || q.includes('leçon') || q.includes('chapitre')) {
      return `### 💡 Résumé : ${courseContext.currentLessonTitle || courseContext.courseTitle}

Dans cette session, concentrez-vous sur :
1. **L'application concrète** des concepts démontrés par le formateur.
2. **Le découpage du code** en composants réutilisables et lisibles.
3. **Le test sur votre machine** en téléchargeant les ressources du projet dans l'onglet *« Ressources & Fichiers »*.`;
    }
  }

  // 7. Questions par technologie
  if (q.includes('react') || q.includes('next')) {
    return `### ⚡ Next.js 15 & React 19 sur SkillHub

Next.js 15 représente le standard actuel pour concevoir des applications web ultra-rapides :
- **React Server Components (RSC)** pour un chargement instantané côté client.
- **Server Actions** : communiquez avec votre base de données sans écrire de routes d'API superflues.
- **App Router** moderne avec layouts imbriqués et streaming.

👉 Découvrez notre cursus complet de 12 heures dispensé par Alexandre Martin dans le catalogue !`;
  }

  if (q.includes('python') || q.includes('machine learning') || q.includes('data')) {
    return `### 🐍 Python, Data Science & Machine Learning

Python est le langage n°1 mondial en analyse de données et intelligence artificielle :
- Manipulez des millions de données avec **Pandas** et **NumPy**.
- Créez des visualisations percutantes avec **Matplotlib** et **Seaborn**.
- Entraînez des modèles prédictifs avec **Scikit-Learn**.

👉 Notre formation de 18 heures animée par le Dr. Karim Mansouri est adaptée aussi bien aux débutants qu'aux profils souhaitant une spécialisation technique.`;
  }

  if (q.includes('docker') || q.includes('devops') || q.includes('kubernetes') || q.includes('cloud')) {
    return `### 🐳 Docker & Kubernetes : Cursus DevOps

Maîtrisez le déploiement continu et la conteneurisation :
- Isolez vos environnements pour éliminer le fameux *"ça marche sur ma machine"*.
- Écrivez des Dockerfiles optimisés et gérez des piles multi-services avec Docker Compose.
- Déployez et orchestrez vos conteneurs sur des clusters Cloud Kubernetes.

👉 Formation de 11h disponible sur notre plateforme.`;
  }

  if (q.includes('figma') || q.includes('design') || q.includes('ui') || q.includes('ux')) {
    return `### 🎨 UI/UX Design avec Figma

Apprenez à concevoir des maquettes d'applications modernes :
- Maîtrise des composants réutilisables, variables et de l'Auto-layout responsive.
- Création de prototypes interactifs haute fidélité pour vos clients.
- Respect des règles d'accessibilité et de hiérarchie visuelle.

👉 Formation de 9 heures avec Sarah Alami, Lead Designer.`;
  }

  if (q.includes('ia') || q.includes('gemini') || q.includes('intelligence artificielle')) {
    return `### 🤖 Agents IA & Google Gemini

Développez la nouvelle génération d'applications autonomes :
- Exploitez le SDK moderne **@google/genai** avec les modèles Gemini 3.
- Connectez des bases de connaissances externes via des architectures RAG.
- Automatisez des workflows complexes avec le Function Calling.

👉 Formation avancée de 15 heures disponible dans le catalogue.`;
  }

  // Salutations courantes
  if (q.includes('bonjour') || q.includes('salut') || q.includes('hello') || q.includes('coucou')) {
    return `Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?

Vous pouvez me demander :
- Des conseils pour choisir une formation adaptée à vos objectifs.
- Des explications sur un concept technique ou une leçon.
- Des détails sur l'obtention de votre certificat ou vos inscriptions.`;
  }

  // 8. Réponse pédagogique générale instantanée
  return `### 💡 Conseil Pédagogique SkillHub

Merci pour votre question !

Sur **SkillHub**, chaque formation est conçue selon une approche 100% pratique :
- **Mise en situation immédiate** : Vous construisez un projet réel pas à pas.
- **Accompagnement continu** : Mini-quiz de validation à chaque module pour ancrer vos acquis.
- **Certification reconnue** : Votre attestation officielle débloquée à 100% de complétion.

👉 N'hésitez pas à explorer notre catalogue dans l'onglet **« Catalogue »** ou à vous inscrire directement depuis l'onglet **« Inscription »** !`;
}
