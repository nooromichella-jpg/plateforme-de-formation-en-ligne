/**
 * Route API Next.js App Router pour le chatbot IA SkillHub (SkillBot).
 * Emplacement: src/app/api/chat/route.ts
 * Connecté au modèle multimodal Google Gemini via le SDK moderne @google/genai.
 * Capable d'analyser le texte, les captures d'écran de code/bugs, et les fichiers sources.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Instructions système d'ingénieur logiciel senior et tuteur en informatique
const TUTOR_SYSTEM_INSTRUCTION = `Tu es SkillBot, un tuteur pédagogique expert, bienveillant et rigoureux pour la plateforme de formation en ligne SkillHub à Madagascar.
Tu es un ingénieur logiciel senior et mentor en développement informatique (Fullstack React 19, Next.js 15, TypeScript, Python pour la Data/ML, IA & Gemini, Docker/DevOps, UI/UX Design Figma).

CATALOGUE OFFICIEL SKILLHUB :
1. Développement d'Agents IA avec Google Gemini & LangChain : 300 000 Ar (Avancé, 15h)
2. Next.js 15 & React 19 : Le Guide Complet Fullstack : 250 000 Ar (Intermédiaire, 12h)
3. Docker & Kubernetes : Déploiement Cloud et CI/CD DevOps : 275 000 Ar (Intermédiaire, 11h)
4. Initiation Gratuite au Développement Web (HTML, CSS & JS) : 100% Gratuit (Débutant, 4h)
5. Python pour la Data Science et le Machine Learning : 225 000 Ar (Tous niveaux, 18h)
6. UI/UX Design Moderne avec Figma : 200 000 Ar (Débutant, 9h)

CAPACITÉS MULTIMODALES & ANALYSE D'IMAGES :
Lorsque l'étudiant t'envoie une capture d'écran (code, message d'erreur, console du navigateur, terminal, interface décalée) :
1. ANALYSE VISUELLE DÉTAILLÉE :
   - Inspecte minutieusement l'image. Lis textuellement tout message d'erreur visible (console rouge, stack trace, exception, numéro de ligne, code HTTP).
   - Indique clairement à l'étudiant l'erreur ou l'anomalie que tu as repérée dans l'image.
2. EXPLICATION & CAUSE DU PROBLÈME :
   - Explique la cause technique avec clarté et pédagogie, sans jargon inutile.
3. SOLUTION CONCRÈTE & CODE CORRIGÉ :
   - Donne systématiquement le code corrigé dans des blocs Markdown avec coloration syntaxique (\`\`\`tsx, \`\`\`typescript, \`\`\`python, \`\`\`bash, etc.).
   - Précise exactement ce qui doit être modifié ou remplacé.
4. BIENVEILLANCE & ORIENTATION :
   - Encourage l'étudiant, sois chaleureux et constructif.
   - Si l'étudiant pose une question sur ses cours, rappelle que ses cours inscrits se trouvent dans "Mon espace d'apprentissage" (/my-courses) et que l'inscription se fait sur /register.
   - Réponds toujours en français soigné et lisible.`;

// Liste ordonnée de modèles de secours pour résister aux pics de charge 503 / 429
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, courseContext, attachments } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Le tableau de messages est invalide ou vide." },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const userText = lastUserMessage?.content?.trim() || '';

    // Préparation des parts pour le modèle multimodal
    const userParts: any[] = [];

    // 1. Texte utilisateur
    const promptText = userText || (attachments && attachments.length > 0 ? "Veuillez analyser cette capture d'écran / ce fichier joint et m'expliquer ce que vous observez, l'erreur éventuelle et la solution étape par étape." : "Bonjour !");
    userParts.push({ text: promptText });

    // 2. Pièces jointes (images & fichiers de code)
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
              // Ignore decoding failure
            }
          }
        }
      }
    }

    // Enrichissement du prompt système avec le contexte du cours
    let enrichedSystemInstruction = TUTOR_SYSTEM_INSTRUCTION;
    if (courseContext?.courseTitle) {
      enrichedSystemInstruction += `\n\n[CONTEXTE DE LA SESSION ACTUELLE] :
L'étudiant suit actuellement la formation : "${courseContext.courseTitle}".`;
      if (courseContext.currentModuleTitle) {
        enrichedSystemInstruction += `\nModule actuel : "${courseContext.currentModuleTitle}".`;
      }
      if (courseContext.currentLessonTitle) {
        enrichedSystemInstruction += `\nLeçon active : "${courseContext.currentLessonTitle}".`;
      }
      enrichedSystemInstruction += `\nAdapte tes exemples et explications aux concepts de ce cours spécifique.`;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Construction de l'historique récent (jusqu'aux 6 derniers messages)
      const recentHistory: any[] = [];
      const previousMessages = messages.slice(-6);

      for (let i = 0; i < previousMessages.length; i++) {
        const msg = previousMessages[i];
        const isLast = i === previousMessages.length - 1;

        if (isLast && msg.role === 'user') {
          // Remplacer le dernier message utilisateur par les parts multimodales enrichies
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

      // Si le dernier message dans recentHistory n'est pas user, ajouter nos parts
      if (recentHistory.length === 0 || recentHistory[recentHistory.length - 1].role !== 'user') {
        recentHistory.push({
          role: 'user',
          parts: userParts,
        });
      }

      // Exécution avec bascule de modèle en cas de pic 503
      for (const model of CANDIDATE_MODELS) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          attempts++;
          try {
            const response = await ai.models.generateContent({
              model,
              contents: recentHistory,
              config: {
                systemInstruction: enrichedSystemInstruction,
                temperature: 0.6,
                abortSignal: AbortSignal.timeout(18000),
              },
            });

            if (response.text && response.text.trim()) {
              return NextResponse.json({
                reply: response.text,
                timestamp: new Date().toISOString(),
                model,
                multimodal: userParts.length > 1,
              });
            }
          } catch (modelError: any) {
            const isDemandSpike =
              modelError?.message?.includes('503') ||
              modelError?.message?.includes('high demand') ||
              modelError?.message?.includes('UNAVAILABLE') ||
              modelError?.status === 503 ||
              modelError?.status === 429;

            if (isDemandSpike && attempts < maxAttempts) {
              await sleep(400 * attempts);
              continue;
            }

            console.warn(`[Route Next.js] Modèle ${model} temporairement indisponible, basculement vers le suivant...`);
            break;
          }
        }
      }
    }

    // Réponse de secours si l'API est inaccessible
    return NextResponse.json({
      reply: "### 💡 Assistant SkillBot\n\nJ'ai bien pris en compte votre message et vos éléments joints ! Pour vous aider au mieux, n'hésitez pas à préciser sur quelle partie de votre code ou de votre leçon vous rencontrez des difficultés.",
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  } catch (error: any) {
    console.error("Erreur dans /api/chat route:", error?.message);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre demande." },
      { status: 500 }
    );
  }
}
