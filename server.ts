import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getInstantKnowledgeResponse } from './src/lib/chatbotKnowledge.ts';

dotenv.config();

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1], 10) : undefined;
const hostIndex = args.indexOf('--host');
const cliHost = hostIndex !== -1 && args[hostIndex + 1] ? args[hostIndex + 1] : undefined;

const PORT = cliPort || Number(process.env.PORT) || 3000;
const HOST = cliHost || process.env.HOST || '0.0.0.0';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const SYSTEM_INSTRUCTION = `Tu es SkillBot, un tuteur pédagogique intelligent et bienveillant pour la plateforme de cours en ligne SkillHub à Madagascar. 
Tu aides les étudiants à comprendre leurs leçons, préparer leurs quiz, naviguer dans les formations et retrouver leur espace personnel.

Voici la liste officielle de nos formations et tarifs actuels (Ne invente pas d'autres prix) :
1. Développement d'Agents IA avec Google Gemini & LangChain : 300 000 Ar (Avancé, 15h)
2. Next.js 15 & React 19 : Le Guide Complet Fullstack : 250 000 Ar (Intermédiaire, 12h)
3. Docker & Kubernetes : Déploiement Cloud et CI/CD DevOps : 275 000 Ar (Intermédiaire, 11h)
4. Initiation Gratuite au Développement Web (HTML, CSS & JS) : 100% Gratuit (Débutant, 4h)
5. Python pour la Data Science et le Machine Learning : 225 000 Ar (Tous niveaux, 18h)
6. UI/UX Design Moderne avec Figma : 200 000 Ar (Débutant, 9h)

Règles de navigation pour les étudiants :
- Pour s'inscrire à une formation : indiquer la page d'inscription des étudiants (accessible sur la page /register ou en cliquant sur l'onglet "Inscription").
- Une fois qu'un étudiant est inscrit à une formation, il retrouve tous ses cours achetés ou suivis dans son espace personnel distinct "Mon espace d'apprentissage" (accessible sur la page /my-courses ou en cliquant sur "Mon espace d'apprentissage").
- La page d'inscription (/register) et l'espace d'apprentissage personnel (/my-courses) sont deux pages bien séparées.
- Si un étudiant demande où voir ses cours ou où aller après son inscription, indique-lui de cliquer sur "Mon espace d'apprentissage".

Consignes de style et de réponse :
- Réponds toujours en français, avec un ton bienveillant, clair, stimulant et professionnel.
- Utilise la syntaxe Markdown pour la lisibilité : **gras**, \`code\`, blocs de code avec coloration syntaxique si pertinent, listes à puces.
- N'invente jamais d'autres tarifs ou formations extérieures sans rapport avec SkillHub à Madagascar.`;

// Liste ordonnée de modèles Gemini pris en charge pour assurer une tolérance aux pannes et résister aux pics de charge (503 / 429)
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Moteur de réponse pédagogique intelligente en cas de pic de charge temporaire des serveurs Gemini (503/429)
 */
function generateContextualFallback(
  userQuery: string,
  courseContext?: { courseTitle?: string; currentLessonTitle?: string; currentModuleTitle?: string }
): string {
  const query = userQuery.toLowerCase();

  // Question sur l'inscription
  if (query.includes('comment s\'inscrire') || query.includes('comment m\'inscrire') || query.includes('inscription') || query.includes('m\'inscrire') || query.includes('register')) {
    return `### 📝 S'inscrire à une formation sur SkillHub\n\nPour vous inscrire à un cours sur SkillHub :\n1. Rendez-vous sur la **Page d'Inscription des Étudiants** (accessible en cliquant sur l'onglet **« Inscription »** dans la barre de navigation ou via \`/register\`).\n2. Choisissez votre formation parmi notre catalogue officiel.\n3. Renseignez vos coordonnées d'étudiant.\n4. Pour les cours payants, choisissez votre opérateur Mobile Money (**MVola**, **Orange Money**, **Airtel Money**).\n5. Validez pour rejoindre instantanément le cours et le retrouver dans votre espace dédié **« Mon espace d'apprentissage »** !`;
  }

  // Navigation vers l'espace personnel / après inscription
  if (
    query.includes('où') || 
    query.includes('ou voir') || 
    query.includes('retrouver') || 
    query.includes('mes cours') || 
    query.includes('mes formations') || 
    query.includes('mes inscriptions') || 
    query.includes('après inscription') || 
    query.includes('apres inscription') || 
    query.includes('espace') || 
    query.includes('my-courses')
  ) {
    return `### 🎓 Retrouver vos formations sur SkillHub\n\nUne fois inscrit à une formation, vous pouvez retrouver tous vos cours achetés ou suivis dans votre espace personnel **« Mon espace d'apprentissage »** (accessible également via la page \`/my-courses\`).\n\n👉 **Où aller après votre inscription ?**\nIl vous suffit de cliquer sur **« Mon espace d'apprentissage »** dans la barre de navigation en haut de l'écran pour accéder à vos leçons vidéo, reprendre là où vous vous étiez arrêté et valider vos quiz certifiants !`;
  }

  if (courseContext?.courseTitle) {
    if (query.includes('résum') || query.includes('resume') || query.includes('leçon') || query.includes('chapitre')) {
      return `### 💡 Résumé pédagogique - ${courseContext.currentLessonTitle || 'Cette leçon'}\n\nDans cette partie de **${courseContext.courseTitle}**, vous travaillez sur les concepts fondamentaux de : **${courseContext.currentLessonTitle || 'ce chapitre'}**.\n\n**Points clés à retenir :**\n- **Architecture propre** : Séparez les responsabilités (composants UI, logique métier, requêtes réseau).\n- **Gestion des états** : Assurez-vous d'avoir des états stables pour éviter les re-rendus inutiles.\n- **Validation continue** : Pensez à compléter le mini-QCM interactif à la fin du module pour débloquer votre certificat !\n\n*Avez-vous une question spécifique sur une ligne de code ou une notion du cours ?*`;
    }

    if (query.includes('quiz') || query.includes('qcm') || query.includes('examen') || query.includes('question')) {
      return `### 🎯 Préparation au Quiz du Chapitre\n\nPour réussir le quiz de **${courseContext.courseTitle}** avec 100% de réussite :\n1. **Revoir les concepts clés** abordés dans les leçons vidéo du module.\n2. **Prenez le temps de bien lire les questions** : chaque proposition a une explication détaillée en cas de doute.\n3. Dès que vous obtenez au moins 70%, le module est validé et votre certificat devient accessible !\n\nN'hésitez pas à me demander des clarifications sur un concept avant de lancer le quiz !`;
    }

    if (query.includes('exemple') || query.includes('code') || query.includes('syntaxe')) {
      return `### 💻 Exemple pratique pour ${courseContext.courseTitle}\n\nVoici un exemple d'application typique lié à **${courseContext.currentLessonTitle || 'cette thématique'}** :\n\n\`\`\`typescript\n// Exemple de fonction moderne et robuste\nexport async function handleDataOperation(input: string) {\n  if (!input.trim()) throw new Error("Entrée invalide");\n  \n  try {\n    const result = await processDataAsync(input);\n    return { success: true, data: result };\n  } catch (error) {\n    console.error("Erreur opération:", error);\n    return { success: false, error: "Échec de l'opération" };\n  }\n}\n\`\`\`\n\nCette approche garantit un code modulaire, typé et prêt pour la production !`;
    }
  }

  if (query.includes('next') || query.includes('react')) {
    return `### ⚡ Next.js 15 & React 19 sur SkillHub\n\nNext.js 15 introduit des avancées majeures :\n- **React Server Components (RSC)** par défaut pour un bundle client minimal.\n- **Server Actions** simplifiées pour manipuler vos bases de données (Firestore, Cloud SQL) directement sans créer manuellement des routes REST.\n- **App Router** optimisé avec gestion asynchrone des \`params\` et \`searchParams\`.\n\nVous pouvez suivre notre formation complète animée par Alexandre Martin avec 12h de pratique intensive !`;
  }

  if (query.includes('ia') || query.includes('gemini') || query.includes('langchain') || query.includes('agent')) {
    return `### 🤖 Intelligence Artificielle & Google Gemini sur SkillHub\n\nNotre formation dédiée aux **Agents IA avec Google Gemini & LangChain** vous apprend à :\n- Exploiter le SDK moderne \`@google/genai\` avec les modèles Gemini 3 (\`gemini-3.8-flash\`, \`gemini-3.1-pro-preview\`).\n- Construire des chaînes RAG (Retrieval Augmented Generation) connectées à des bases vectorielles.\n- Déployer des agents autonomes avec *Function Calling* capables d'exécuter des outils en direct.\n\nC'est l'une des formations les plus prisées cette année !`;
  }

  if (query.includes('certificat') || query.includes('diplome') || query.includes('attestation')) {
    return `### 🏆 Obtenir votre Certificat Officiel SkillHub\n\nPour débloquer et télécharger votre certificat nominatif certifié :\n1. **Complétez 100% des leçons vidéo** du cours inscrit.\n2. **Validez les mini-quiz (QCM)** à la fin de chaque chapitre.\n3. Dès l'obtention des 100%, le bouton **« Télécharger mon certificat »** s'active automatiquement avec votre nom, date et ID unique d'accréditation !`;
  }

  if (query.includes('bonjour') || query.includes('salut') || query.includes('hello') || query.includes('qui es-tu')) {
    return `Bonjour ! 👋 Je suis **SkillBot**, votre copilote d'apprentissage sur SkillHub.\n\nJe suis là pour vous aider à :\n- Répondre à vos questions sur vos cours actuels\n- Vous préparer aux quiz de validation des chapitres\n- Vous orienter vers la formation idéale pour booster votre carrière tech\n\nQue souhaitez-vous explorer aujourd'hui ?`;
  }

  return `### 💡 Conseil Pédagogique SkillBot\n\nMerci pour votre question ! Sur la plateforme **SkillHub**, notre objectif est de vous accompagner de manière concrète et méthodique.\n\nPour progresser efficacement :\n- **Pratiquez directement** dans les projets guidés fournis dans chaque module.\n- **Utilisez les mini-quiz de validation** pour tester immédiatement vos réflexes.\n- Si vous avez un doute sur un bout de code précis ou une démarche, collez-le ici et nous l'analyserons ensemble !\n\n*Avez-vous besoin d'un exemple concret ou d'une recommandation de cours ?*`;
}

// Endpoint de l'assistant IA avec modèle multimodal Gemini 3 et analyse d'images
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, courseContext, attachments } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Le tableau de messages est invalide ou vide." });
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const userText = lastUserMessage?.content?.trim() || '';

    // Préparation des parts multimodales pour Google Gemini
    const userParts: any[] = [];
    const promptText = userText || (attachments && attachments.length > 0 ? "Veuillez analyser cette capture d'écran / ce fichier joint et m'expliquer ce que vous observez, l'erreur éventuelle et la solution étape par étape." : "Bonjour !");
    userParts.push({ text: promptText });

    // Traitement des pièces jointes (images & fichiers)
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att && att.data) {
          const rawData = String(att.data);
          const cleanBase64 = rawData.replace(/^data:[^;]+;base64,/, '');
          const mimeType = att.mimeType || (att.type === 'image' ? 'image/png' : 'text/plain');

          if (mimeType.startsWith('image/')) {
            userParts.push({
              inlineData: {
                mimeType: mimeType.split(';')[0],
                data: cleanBase64,
              },
            });
          } else if (att.type === 'code' || mimeType.includes('text') || mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) {
            try {
              const decodedText = Buffer.from(cleanBase64, 'base64').toString('utf-8');
              userParts.push({
                text: `\n\n[Fichier de code joint: ${att.name || 'code.txt'}] :\n\`\`\`\n${decodedText.slice(0, 15000)}\n\`\`\`\n`,
              });
            } catch {
              // Ignore
            }
          }
        }
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });

      let enrichedSystemInstruction = SYSTEM_INSTRUCTION;
      if (courseContext?.courseTitle) {
        enrichedSystemInstruction += `\n\n[CONTEXTE DE LA FORMATION ACTIVE] :
L'étudiant suit actuellement : "${courseContext.courseTitle}".
${courseContext.currentModuleTitle ? `Module : "${courseContext.currentModuleTitle}".\n` : ''}${courseContext.currentLessonTitle ? `Leçon : "${courseContext.currentLessonTitle}".\n` : ''}
Adapte tes explications et exemples à cette formation.`;
      }

      // Construction de l'historique récent
      const recentHistory: any[] = [];
      const previousMessages = messages.slice(-6);

      for (let i = 0; i < previousMessages.length; i++) {
        const msg = previousMessages[i];
        const isLast = i === previousMessages.length - 1;

        if (isLast && msg.role === 'user') {
          recentHistory.push({
            role: 'user',
            parts: userParts,
          });
        } else {
          recentHistory.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content || '' }],
          });
        }
      }

      if (recentHistory.length === 0 || recentHistory[recentHistory.length - 1].role !== 'user') {
        recentHistory.push({
          role: 'user',
          parts: userParts,
        });
      }

      // Appel direct au modèle multimodal Gemini 3
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: recentHistory,
          config: {
            systemInstruction: enrichedSystemInstruction,
            temperature: 0.6,
            abortSignal: AbortSignal.timeout(18000),
          },
        });

        if (response.text && response.text.trim()) {
          return res.json({
            reply: response.text,
            timestamp: new Date().toISOString(),
            model: 'gemini-3.8-flash',
            multimodal: userParts.length > 1,
          });
        }
      } catch (geminiError: any) {
        console.warn("[Express /api/chat] gemini-3.8-flash indisponible, essai gemini-flash-latest:", geminiError?.message);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: recentHistory,
            config: {
              systemInstruction: enrichedSystemInstruction,
              temperature: 0.6,
              abortSignal: AbortSignal.timeout(12000),
            },
          });

          if (fallbackResponse.text && fallbackResponse.text.trim()) {
            return res.json({
              reply: fallbackResponse.text,
              timestamp: new Date().toISOString(),
              model: 'gemini-flash-latest',
              multimodal: userParts.length > 1,
            });
          }
        } catch (fallbackError: any) {
          console.warn("[Express /api/chat] Échec des modèles distants:", fallbackError?.message);
        }
      }
    }

    // Réponse de repli si hors-ligne ou pic momentané
    const fallbackReply = generateContextualFallback(userText, courseContext);
    return res.json({
      reply: fallbackReply,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  } catch (error: any) {
    console.warn("Erreur gérée dans /api/chat:", error?.message);
    const fallbackReply = generateContextualFallback(req.body?.messages?.[0]?.content || '', req.body?.courseContext);
    return res.json({
      reply: fallbackReply,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
    console.log(`  Serveur SkillHub prêt sur le port ${PORT}\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Serveur] Le port ${PORT} est déjà alloué à une instance existante.`);
    } else {
      console.error('[Serveur] Erreur:', err);
    }
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

startServer();
