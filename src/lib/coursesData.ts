import { Course, CourseModule, ChapterQuiz } from '@/src/types';

export const COURSES_DATA: Course[] = [
  {
    id: 'course-1',
    title: 'Next.js 15 & React 19 : Le Guide Complet Fullstack',
    slug: 'nextjs-react-guide-complet-fullstack',
    shortDescription: 'Maîtrisez les Server Actions, l’App Router, Tailwind CSS et déployez des applications modernes et performantes.',
    description: `Cette formation vous guide pas à pas dans l'écosystème React et Next.js 15 moderne. Vous apprendrez à concevoir des architectures robustes, du rendu hybride (SSR, SSG, RSC) jusqu'à la mise en production sur le Cloud.
    
À travers des projets concrets, vous découvrirez les bonnes pratiques pour intégrer des bases de données comme Firebase et Cloud SQL, sécuriser vos routes, optimiser le Core Web Vitals et connecter des APIs modernes.`,
    instructor: {
      id: 'inst-1',
      name: 'Alexandre Martin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: 'Lead Architect Frontend @ TechPulse',
      bio: 'Développeur Fullstack depuis 12 ans, contributeur Open Source et formateur passionné par les architectures réactives modernes.',
      studentsCount: 14200,
      coursesCount: 5,
    },
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    category: 'development',
    level: 'intermediate',
    price: 250000,
    originalPrice: 450000,
    durationMinutes: 720, // 12h
    lessonsCount: 48,
    rating: 4.9,
    reviewsCount: 342,
    badge: 'bestseller',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Fullstack'],
    learningOutcomes: [
      'Construire des applications web complètes avec Next.js 15 App Router',
      'Maîtriser les Server Actions, Server Components et Client Components',
      'Intégrer Firebase Auth et Firestore pour la persistance temps réel',
      'Déployer et monitorer une application en production sur le Cloud'
    ],
    prerequisites: [
      'Bonnes connaissances de base en JavaScript moderne (ES6+)',
      'Notions élémentaires de React (JSX, props, hooks useState/useEffect)'
    ],
    language: 'Français',
    publishedAt: '2025-01-15',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 : Fondamentaux & Nouvelle Architecture Next.js 15',
        lessons: [
          { id: 'l-1', title: 'Introduction à l’écosystème React 19 et Next.js 15', durationMinutes: 15, isPreview: true, order: 1 },
          { id: 'l-2', title: 'Comprendre le Server-Side Rendering et les React Server Components', durationMinutes: 25, isPreview: true, order: 2 },
          { id: 'l-3', title: 'Organisation optimale du répertoire /app et routage imbriqué', durationMinutes: 20, order: 3 },
          { id: 'l-4', title: 'Gestion du layout, templates et gestionnaires d’erreur personnalisés', durationMinutes: 22, order: 4 },
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2 : Data Fetching, Mutations & Server Actions',
        lessons: [
          { id: 'l-5', title: 'Appels de données directs côté serveur sans useEffect', durationMinutes: 30, order: 5 },
          { id: 'l-6', title: 'Création et sécurisation de Server Actions', durationMinutes: 35, order: 6 },
          { id: 'l-7', title: 'Revalidation du cache avec revalidatePath et revalidateTag', durationMinutes: 25, order: 7 },
        ]
      },
      {
        id: 'mod-3',
        title: 'Module 3 : Authentification & Base de données Firestore',
        lessons: [
          { id: 'l-8', title: 'Configuration de Firebase Auth avec Google Sign-In', durationMinutes: 30, order: 8 },
          { id: 'l-9', title: 'Modélisation des données dans Firestore et règles de sécurité', durationMinutes: 40, order: 9 },
          { id: 'l-10', title: 'Synchronisation des états d’inscription en temps réel', durationMinutes: 35, order: 10 },
        ]
      },
      {
        id: 'mod-4',
        title: 'Module 4 : Optimisation, Tests & Déploiement Cloud',
        lessons: [
          { id: 'l-11', title: 'Optimisation SEO avancée, OpenGraph et métadonnées dynamiques', durationMinutes: 25, order: 11 },
          { id: 'l-12', title: 'Mise en production et monitoring des performances Web Vitals', durationMinutes: 30, order: 12 },
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Développement d’Agents IA avec Google Gemini & LangChain',
    slug: 'developpement-agents-ia-gemini',
    shortDescription: 'Apprenez à concevoir des assistants autonomes, des systèmes RAG et des chatbots intelligents avec Gemini 3.',
    description: `Découvrez comment intégrer la puissance des modèles Gemini 3 de Google dans des logiciels réels. Vous découvrirez les mécanismes d'orchestration d'agents, de function calling (appel d'outils), de recherche vectorielle et de génération augmentée de récupération (RAG).

À la fin de ce cours, vous saurez déployer des copilotes conversationnels connectés à vos bases documentaires et capables d'agir sur des services externes.`,
    instructor: {
      id: 'inst-2',
      name: 'Sarah Benali',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      title: 'AI Research Engineer & Consultante',
      bio: 'Experte en NLP et IA générative, conférencière internationale et accompagnatrice de startups tech.',
      studentsCount: 9800,
      coursesCount: 3,
    },
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    category: 'ai-data',
    level: 'advanced',
    price: 300000,
    originalPrice: 500000,
    durationMinutes: 900, // 15h
    lessonsCount: 54,
    rating: 4.95,
    reviewsCount: 218,
    badge: 'nouveau',
    tags: ['Gemini', 'IA Générative', 'Python', 'LLM', 'RAG'],
    learningOutcomes: [
      'Exploiter le SDK @google/genai pour le streaming et le function calling',
      'Concevoir des pipelines RAG avec bases de données vectorielles',
      'Mettre en place des agents multi-outils autonomes et sécurisés',
      'Optimiser le coût des tokens et la latence des requêtes IA'
    ],
    prerequisites: [
      'Bonne maîtrise de TypeScript ou Python',
      'Compréhension générale du fonctionnement des APIs REST'
    ],
    language: 'Français',
    publishedAt: '2025-02-10',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 : Panorama des Modèles Gemini 3 & SDK Moderne',
        lessons: [
          { id: 'l-1', title: 'Architecture des modèles Gemini 3 et capacités multimodales', durationMinutes: 20, isPreview: true, order: 1 },
          { id: 'l-2', title: 'Prise en main du nouveau SDK @google/genai', durationMinutes: 30, isPreview: true, order: 2 },
          { id: 'l-3', title: 'Gestion de la température, system instructions et streaming', durationMinutes: 25, order: 3 },
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2 : Function Calling & Connexion aux Outils Externes',
        lessons: [
          { id: 'l-4', title: 'Déclarer et exécuter des outils personnalisés', durationMinutes: 35, order: 4 },
          { id: 'l-5', title: 'Construction d’une boucle d’agent autonome décisionnelle', durationMinutes: 45, order: 5 },
        ]
      },
      {
        id: 'mod-3',
        title: 'Module 3 : Systèmes RAG (Retrieval-Augmented Generation)',
        lessons: [
          { id: 'l-6', title: 'Embeddings sémantiques et segmentation de documents', durationMinutes: 40, order: 6 },
          { id: 'l-7', title: 'Recherche vectorielle et synthèse documentaire augmentée', durationMinutes: 50, order: 7 },
        ]
      }
    ]
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Moderne avec Figma : Du Wireframe au Prototype',
    slug: 'ui-ux-design-moderne-figma',
    shortDescription: 'Créez des interfaces élégantes, des design systems scalables et des prototypes interactifs haute fidélité.',
    description: `Apprenez à concevoir des produits digitaux ergonomiques et captivants. De l'analyse des besoins utilisateurs à la conception d'un Design System complet dans Figma, vous explorerez l'intégralité du workflow d'un Product Designer professionnel.`,
    instructor: {
      id: 'inst-3',
      name: 'Julien Lefebvre',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      title: 'Product Designer Senior',
      bio: 'Créateur de design systems pour des licornes européennes avec plus de 10 ans d’expérience en UX Research.',
      studentsCount: 18500,
      coursesCount: 4,
    },
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    category: 'design',
    level: 'beginner',
    price: 200000,
    originalPrice: 350000,
    durationMinutes: 540, // 9h
    lessonsCount: 36,
    rating: 4.85,
    reviewsCount: 184,
    badge: 'populaire',
    tags: ['Figma', 'UI Design', 'UX Research', 'Design System'],
    learningOutcomes: [
      'Maîtriser Auto-Layout, les variables et les composants Figma',
      'Bâtir un Design System cohérent, réutilisable et responsive',
      'Créer des micro-interactions et prototypes interactifs avancés'
    ],
    prerequisites: ['Aucun prérequis technique nécessaire.'],
    language: 'Français',
    publishedAt: '2024-11-20',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 : Principes UX & Prise en main de Figma',
        lessons: [
          { id: 'l-1', title: 'Méthodologie UX : Recherche et wireframing', durationMinutes: 25, isPreview: true, order: 1 },
          { id: 'l-2', title: 'L’interface Figma et les raccourcis clés', durationMinutes: 20, isPreview: true, order: 2 },
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2 : Auto-Layout, Composants & Variables',
        lessons: [
          { id: 'l-3', title: 'Maîtriser l’Auto-Layout sous tous ses aspects', durationMinutes: 40, order: 3 },
          { id: 'l-4', title: 'Créer des composants avec variantes et propriétés', durationMinutes: 35, order: 4 },
        ]
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Python pour la Data Science et le Machine Learning',
    slug: 'python-data-science-machine-learning',
    shortDescription: 'Pandas, NumPy, Scikit-Learn et visualisation de données pour résoudre des problèmes business concrets.',
    description: `Découvrez comment extraire des insights à partir de gros volumes de données et construire vos premiers algorithmes prédictifs avec Python. Ce cours est 100% orienté pratique avec des jeux de données réels.`,
    instructor: {
      id: 'inst-4',
      name: 'Dr. Karim Mansouri',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      title: 'Data Scientist & Chercheur',
      bio: 'Docteur en informatique appliquée et formateur certifié en Machine Learning et traitement de données massives.',
      studentsCount: 11300,
      coursesCount: 2,
    },
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    category: 'ai-data',
    level: 'all-levels',
    price: 225000,
    originalPrice: 400000,
    durationMinutes: 1080, // 18h
    lessonsCount: 62,
    rating: 4.88,
    reviewsCount: 420,
    badge: 'bestseller',
    tags: ['Python', 'Data Science', 'Pandas', 'Machine Learning'],
    learningOutcomes: [
      'Nettoyer et manipuler des jeux de données volumineux avec Pandas et NumPy',
      'Créer des tableaux de bord interactifs et des graphiques percutants',
      'Entraîner et évaluer des modèles de classification et de régression'
    ],
    prerequisites: ['Bases de la programmation ou forte motivation pour apprendre.'],
    language: 'Français',
    publishedAt: '2024-10-05',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 : Manipulation de Données avec Pandas',
        lessons: [
          { id: 'l-1', title: 'DataFrames, séries et opérations vectorisées', durationMinutes: 30, isPreview: true, order: 1 },
          { id: 'l-2', title: 'Traitement des valeurs manquantes et doublons', durationMinutes: 25, order: 2 },
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2 : Introduction aux Algorithmes de Machine Learning',
        lessons: [
          { id: 'l-3', title: 'Régression linéaire et classification logistique', durationMinutes: 45, order: 3 },
          { id: 'l-4', title: 'Évaluation des modèles : matrice de confusion et score ROC', durationMinutes: 35, order: 4 },
        ]
      }
    ]
  },
  {
    id: 'course-5',
    title: 'Docker & Kubernetes : Déploiement Cloud et CI/CD DevOps',
    slug: 'docker-kubernetes-devops-cloud',
    shortDescription: 'Conteneurisez vos applications, gérez l’orchestration et automatisez les déploiements avec GitHub Actions.',
    description: `Passez du code en local au déploiement robuste à grande échelle. Maîtrisez la création d'images Docker légères, la configuration d'environnements multi-conteneurs et l'orchestration avec Kubernetes.`,
    instructor: {
      id: 'inst-5',
      name: 'Thomas Laurent',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      title: 'DevOps & Cloud Engineer',
      bio: 'Spécialiste de l’infrastructure Cloud et des pipelines CI/CD automatisés.',
      studentsCount: 7600,
      coursesCount: 2,
    },
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
    category: 'devops',
    level: 'intermediate',
    price: 275000,
    originalPrice: 450000,
    durationMinutes: 660, // 11h
    lessonsCount: 40,
    rating: 4.79,
    reviewsCount: 165,
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud', 'DevOps'],
    learningOutcomes: [
      'Écrire des Dockerfiles légers et sécurisés',
      'Orchestrer des pods et ingress avec Kubernetes',
      'Automatiser le déploiement continu avec GitHub Actions'
    ],
    prerequisites: ['Utilisation basique de la ligne de commande Linux / Bash.'],
    language: 'Français',
    publishedAt: '2024-12-01',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 : Docker & Conteneurisation en Profondeur',
        lessons: [
          { id: 'l-1', title: 'Concepts de conteneurs vs machines virtuelles', durationMinutes: 20, isPreview: true, order: 1 },
          { id: 'l-2', title: 'Optimisation multi-stage des Dockerfiles', durationMinutes: 30, order: 2 },
        ]
      }
    ]
  },
  {
    id: 'course-6',
    title: 'Initiation Gratuite au Développement Web (HTML, CSS & JS)',
    slug: 'initiation-gratuite-developpement-web',
    shortDescription: 'Apprenez les bases indispensables du web et créez vos premières pages interactives pas à pas.',
    description: `Une formation d'introduction 100% gratuite pour faire ses premiers pas dans le code en douceur. Vous découvrirez les balises HTML essentielles, le style CSS et la programmation interactive avec JavaScript.`,
    instructor: {
      id: 'inst-1',
      name: 'Alexandre Martin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: 'Lead Architect Frontend @ TechPulse',
      bio: 'Développeur Fullstack depuis 12 ans, formateur passionné.',
      studentsCount: 14200,
      coursesCount: 5,
    },
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80',
    category: 'development',
    level: 'beginner',
    price: 0,
    isFree: true,
    durationMinutes: 240, // 4h
    lessonsCount: 18,
    rating: 4.92,
    reviewsCount: 890,
    badge: 'populaire',
    tags: ['HTML', 'CSS', 'JavaScript', 'Débutant', 'Gratuit'],
    learningOutcomes: [
      'Structurer une page HTML5 moderne et accessible',
      'Styliser avec du CSS responsive (Flexbox & Grid)',
      'Programmer vos premières interactions utilisateur en JavaScript'
    ],
    prerequisites: ['Aucun prérequis. Ouvert à toutes et à tous.'],
    language: 'Français',
    publishedAt: '2024-09-01',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 : Premiers pas avec HTML & CSS',
        lessons: [
          { id: 'l-1', title: 'Structure globale d’un document web', durationMinutes: 15, isPreview: true, order: 1 },
          { id: 'l-2', title: 'Stylisation des textes, couleurs et boîtes', durationMinutes: 20, isPreview: true, order: 2 },
        ]
      }
    ]
  }
];

export function getCourseByIdOrSlug(idOrSlug: string, customList?: Course[]): Course | undefined {
  const list = customList && customList.length > 0 ? customList : COURSES_DATA;
  return list.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

/**
 * Retourne le quiz d'un module ou en génère un contextualisé s'il n'est pas encore défini.
 */
export function getModuleQuiz(module: CourseModule, courseTitle?: string): ChapterQuiz {
  if (module.quiz && module.quiz.questions && module.quiz.questions.length > 0) {
    return module.quiz;
  }

  const cleanModuleTitle = module.title.replace(/^Module \d+\s*:\s*/i, '');

  return {
    id: `quiz-${module.id}`,
    moduleId: module.id,
    title: `Évaluation : ${cleanModuleTitle}`,
    description: `Validez votre compréhension des notions clés de « ${cleanModuleTitle} » pour valider ce module et progresser vers votre certificat.`,
    passingScore: 70,
    questions: [
      {
        id: `q-${module.id}-1`,
        question: `Quelle est la notion fondamentale abordée dans ce chapitre (${cleanModuleTitle}) ?`,
        options: [
          `L'application rigoureuse des bonnes pratiques et de l'architecture moderne`,
          `La désactivation de la vérification des types pour aller plus vite`,
          `La suppression systématique des tests et de la gestion d'erreurs`,
          `L'utilisation exclusive de solutions obsolètes déconseillées`
        ],
        correctAnswerIndex: 0,
        explanation: `Ce chapitre insiste sur l'adoption des standards actuels de l'industrie pour concevoir des applications performantes, sécurisées et maintenables.`
      },
      {
        id: `q-${module.id}-2`,
        question: `Pourquoi est-il crucial de maîtriser les concepts clés de ce module ?`,
        options: [
          `Pour concevoir des systèmes modulaires, testables et évolutifs`,
          `Pour alourdir inutilement le projet`,
          `Pour empêcher toute collaboration en équipe`,
          `Pour contourner les mécanismes de sécurité`
        ],
        correctAnswerIndex: 0,
        explanation: `La modularité et la séparation des responsabilités facilitent la maintenance à long terme et le travail collaboratif en entreprise.`
      },
      {
        id: `q-${module.id}-3`,
        question: `Quelle étape valide définitivement les acquis de ce chapitre sur SkillHub ?`,
        options: [
          `Compléter les leçons pratiques et obtenir au moins 70% de bonnes réponses au quiz`,
          `Passer le cours en accéléré sans pratiquer`,
          `Télécharger des fichiers sans les exécuter`,
          `Ignorer les retours pédagogiques de l'assistant SkillBot`
        ],
        correctAnswerIndex: 0,
        explanation: `L'alternance entre pratique guidée et validation des acquis via QCM garantit un apprentissage pérenne menant au certificat officiel.`
      }
    ]
  };
}
