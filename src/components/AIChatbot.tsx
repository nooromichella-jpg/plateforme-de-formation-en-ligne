'use client';

/**
 * Composant Assistant Chatbot IA SkillHub (SkillBot).
 * Emplacement: src/components/AIChatbot.tsx
 * Bulle flottante interactive connectée à la route API /api/chat propulsée par Google Gemini.
 * Supporte le contexte dynamique de formation (cours, chapitre, quiz).
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  User, 
  BookOpen, 
  ExternalLink,
  AlertCircle,
  Brain,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  Paperclip,
  FileText,
  Code,
  Image as ImageIcon
} from 'lucide-react';
import { ChatMessage, ChatAttachment } from '@/src/types';
import { getInstantKnowledgeResponse } from '@/src/lib/chatbotKnowledge';

interface AIChatbotProps {
  courseContext?: {
    courseTitle?: string;
    currentModuleTitle?: string;
    currentLessonTitle?: string;
  };
  isDark?: boolean;
}

const GENERAL_SUGGESTIONS = [
  "Où puis-je retrouver mes cours après mon inscription ?",
  "Quelles sont les formations disponibles et leurs tarifs ?",
  "Par quoi débuter pour devenir Développeur Web ?",
  "Comment obtenir le certificat de réussite ?"
];

export default function AIChatbot({ courseContext, isDark = false }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<ChatAttachment[]>([]);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptBaseRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion de la sélection de fichiers (images, documents, fichiers de code)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      let sizeStr = '';
      if (file.size < 1024) {
        sizeStr = `${file.size} o`;
      } else if (file.size < 1024 * 1024) {
        sizeStr = `${(file.size / 1024).toFixed(1)} Ko`;
      } else {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
      }

      const isImg = file.type.startsWith('image/');
      const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.sql', '.md', '.sh', '.env', '.php', '.java', '.c', '.cpp', '.rs', '.go'];
      const isCode = codeExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
      const fileType: 'image' | 'code' | 'document' = isImg ? 'image' : isCode ? 'code' : 'document';

      reader.onload = (event) => {
        const url = (event.target?.result as string) || '';
        const newAttachment: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          type: fileType,
          url,
          size: sizeStr,
          mimeType: file.type,
        };

        setAttachedFiles((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachedFiles((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  // Vérification de la compatibilité Web Speech API au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSupport = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsSpeechSupported(Boolean(hasSupport));
    }
  }, []);

  // Arrêter le micro si on ferme la modale ou lors du démontage
  useEffect(() => {
    if (!isOpen && isListening) {
      stopSpeechRecognition();
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [isOpen, isListening]);

  const startSpeechRecognition = () => {
    setSpeechError(null);
    if (typeof window === 'undefined') return;

    const win = window as any;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSpeechSupported(false);
      setSpeechError("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      // Conserver le texte déjà saisi dans l'input pour ajouter la dictée à la suite
      transcriptBaseRef.current = inputValue ? inputValue.trim() : '';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        const spoken = (finalTranscript || interimTranscript).trim();
        if (spoken) {
          const base = transcriptBaseRef.current;
          const updated = base ? `${base} ${spoken}` : spoken;
          setInputValue(updated);
        }
      };

      recognition.onerror = (event: any) => {
        const errType = event?.error;
        // 'aborted' ou 'no-speech' sont des événements normaux (arrêt volontaire, silence), pas des erreurs à afficher
        if (errType === 'aborted' || errType === 'no-speech') {
          setIsListening(false);
          return;
        }

        if (errType === 'not-allowed') {
          setSpeechError("Microphone non autorisé. Cliquez sur l'icône de cadenas ou caméra/micro de votre barre d'adresse pour autoriser.");
        } else if (errType === 'audio-capture') {
          setSpeechError("Aucun microphone actif détecté sur votre appareil.");
        } else if (errType === 'network') {
          setSpeechError("Erreur réseau lors de la reconnaissance vocale.");
        } else {
          setSpeechError("Impossible de capturer la voix. Veuillez réessayer.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Démarrage reconnaissance vocale ignoré:", err?.message || err);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const contextualSuggestions = courseContext?.courseTitle
    ? [
        `Explique-moi les notions clés de "${courseContext.currentLessonTitle || 'cette leçon'}"`,
        `Donne-moi un exemple de code pratique sur ce sujet`,
        `Comment me préparer au quiz de ce module ?`,
        `Quelles sont les erreurs courantes à éviter ?`
      ]
    : GENERAL_SUGGESTIONS;

  // Défilement automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnreadNotification(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    if (isListening) {
      stopSpeechRecognition();
    }
    const messageText = (textToSend || inputValue).trim();
    if ((!messageText && attachedFiles.length === 0) || isLoading) return;

    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText || (filesToSend.length > 0 ? `📎 ${filesToSend.length === 1 ? filesToSend[0].name : `${filesToSend.length} fichiers joints`}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: filesToSend.length > 0 ? filesToSend : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Préparation des pièces jointes converties en base64 pour la vraie API Gemini
    const apiAttachments = filesToSend.map((file) => ({
      name: file.name,
      type: file.type,
      mimeType: file.mimeType || (file.type === 'image' ? 'image/png' : 'text/plain'),
      data: file.url, // Data URL base64 déjà formatée par FileReader
    }));

    try {
      // Appel direct de l'API /api/chat connectée au modèle multimodal Google Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          courseContext,
          attachments: apiAttachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.reply || data.text;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.warn("Bascule vers le moteur d'assistance résilient:", err?.message);
      
      // Réponse de secours intelligente immédiate en cas de coupure réseau
      let fallbackText = '';
      if (filesToSend.length > 0) {
        const first = filesToSend[0];
        if (first.type === 'image') {
          fallbackText = `### 🔍 Capture d'écran reçue (${first.name})\n\nJ'ai bien réceptionné votre capture d'écran ! ${messageText ? `Concernant votre question : *« ${messageText} »*,\n\n` : '\n\n'}**Pistes de résolution immédiate :**\n- S'il s'agit d'une erreur console, vérifiez les variables indéfinies (\`undefined\`) ou les routes API.\n- Si c'est un souci visuel, vérifiez les classes de conteneurs Tailwind (\`flex\`, \`relative\`, \`overflow-hidden\`).\n\nN'hésitez pas à me coller l'extrait de code pour un diagnostic approfondi !`;
        } else if (first.type === 'code') {
          fallbackText = `### 💻 Fichier de code source (${first.name})\n\nJ'ai bien pris en compte votre fichier de code source.\n\n${messageText ? `À propos de : *« ${messageText} »*,\n\n` : ''}Précisez-moi la fonction ou l'élément sur lequel vous souhaitez travailler !`;
        } else {
          fallbackText = `### 📄 Document joint (${first.name})\n\nVotre document a bien été transmis. Que souhaitez-vous analyser ensemble ?`;
        }
      } else {
        fallbackText = getInstantKnowledgeResponse(messageText, courseContext);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  // Formateur simple de Markdown basique
  const renderFormattedContent = (content: string) => {
    // Découper par blocs
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      // Bloc de code simple
      if (para.startsWith('```')) {
        const codeText = para.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '');
        return (
          <pre key={pIdx} className="p-3 my-2 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
            <code>{codeText}</code>
          </pre>
        );
      }

      // Titres
      if (para.startsWith('### ')) {
        return (
          <h4 key={pIdx} className="font-extrabold text-sm text-indigo-500 dark:text-indigo-400 mt-2 mb-1">
            {para.replace('### ', '')}
          </h4>
        );
      }

      // Paragraphes normaux
      return (
        <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed">
          {para.split('\n').map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {lIdx > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Fenêtre de dialogue du Chatbot */}
      {isOpen && (
        <div 
          className={`mb-4 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-slate-100' 
              : 'bg-white border-slate-200/90 text-slate-900'
          }`}
        >
          {/* En-tête */}
          <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <Bot className="w-5 h-5 text-indigo-100" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
              </div>
              <div className="truncate max-w-[200px] sm:max-w-[240px]">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">SkillBot IA</h3>
                  <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded font-mono">Gemini 3</span>
                </div>
                <p className="text-[11px] text-indigo-200 truncate">
                  {courseContext?.courseTitle ? courseContext.courseTitle : 'Tuteur Pédagogique SkillHub'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="Recommencer la conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="Fermer la discussion"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Corps de la conversation */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-3.5 ${
            isDark ? 'bg-slate-950/60' : 'bg-slate-50/70'
          }`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Fichiers / Images joints simulés dans la bulle de discussion */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-2 w-full">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="overflow-hidden rounded-xl">
                          {att.type === 'image' ? (
                            <div 
                              className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/20 shadow-xs max-w-[240px] bg-black/20"
                              onClick={() => setPreviewImageModal(att.url)}
                              title="Cliquer pour agrandir l'image"
                            >
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-full max-h-44 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-xs font-medium">
                                  Agrandir
                                </span>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 flex items-center justify-between text-[10px] text-white">
                                <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                                <span className="text-[9px] opacity-75">{att.size}</span>
                              </div>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-2 p-2 rounded-xl border max-w-[240px] ${
                              msg.role === 'user'
                                ? 'bg-white/15 border-white/25 text-white'
                                : isDark
                                ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                                : 'bg-slate-100 border-slate-200 text-slate-800'
                            }`}>
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                {att.type === 'code' ? <Code className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold truncate leading-tight">{att.name}</p>
                                <p className="text-[9px] opacity-75">{att.size || (att.type === 'code' ? 'Code source' : 'Fichier')}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : msg.isError
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50 rounded-tl-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    {renderFormattedContent(msg.content)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Indicateur de saisie / chargement */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className={`rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5 border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                </div>
              </div>
            )}

            {/* Suggestions rapides si la conversation débute */}
            {messages.length <= 1 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Suggestions utiles :
                </p>
                <div className="flex flex-col gap-1.5">
                  {contextualSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className={`text-left text-xs p-2.5 rounded-xl border transition flex items-center justify-between group shadow-2xs ${
                        isDark 
                          ? 'bg-slate-800/80 hover:bg-indigo-950/60 border-slate-700 text-slate-300 hover:text-indigo-300' 
                          : 'bg-white hover:bg-indigo-50 border-slate-200/90 text-slate-700 hover:text-indigo-700'
                      }`}
                    >
                      <span className="truncate">{suggestion}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 -rotate-90 transition shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire de saisie */}
          <footer className={`p-3 border-t ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            {/* Input fichier caché activé par le trombone */}
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              accept="image/*,.js,.jsx,.ts,.tsx,.py,.html,.css,.json,.sql,.md,.txt,.pdf" 
              className="hidden" 
              onChange={handleFileSelect} 
            />

            {/* Bannière active de transcription vocale en direct */}
            {isListening && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="font-semibold text-[11px]">Écoute en direct... Parlez maintenant</span>
                </div>
                <button
                  type="button"
                  onClick={stopSpeechRecognition}
                  className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white px-2 py-0.5 rounded-md transition cursor-pointer"
                >
                  Arrêter
                </button>
              </div>
            )}

            {/* Notification d'erreur éventuelle sur le micro */}
            {speechError && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 animate-in fade-in duration-200">
                <span className="text-[11px] font-medium truncate">{speechError}</span>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-[11px] ml-2 text-amber-600 hover:text-amber-800 cursor-pointer"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Aperçu des fichiers / images joints avant envoi */}
            {attachedFiles.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-2xl border shadow-xs transition shrink-0 max-w-[210px] ${
                      isDark
                        ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {file.type === 'image' ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-black/20">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : file.type === 'code' ? (
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <Code className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold truncate leading-tight">{file.name}</p>
                      <p className="text-[9px] text-slate-400">{file.size || (file.type === 'image' ? 'Image' : 'Fichier')}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-500 transition cursor-pointer shrink-0 ml-0.5"
                      title="Supprimer ce fichier"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Écoute en direct... Votre voix apparaît ici" : attachedFiles.length > 0 ? "Ajoutez une question sur ce fichier ou envoyez..." : "Posez votre question à SkillBot..."}
                disabled={isLoading}
                className={`w-full border rounded-2xl pl-4 pr-28 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 transition ${
                  isListening
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/60 text-white ring-2 ring-rose-500/30 placeholder:text-rose-400 font-medium'
                      : 'bg-rose-50/70 border-rose-400 text-slate-900 ring-2 ring-rose-500/20 placeholder:text-rose-500 font-medium'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                }`}
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {/* Bouton Trombone pour joindre une capture ou fichier */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className={`p-2 rounded-xl transition flex items-center justify-center cursor-pointer ${
                    attachedFiles.length > 0
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                  title="Joindre une image (capture d'écran de bug) ou un fichier de code"
                  aria-label="Joindre un fichier"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>

                {/* Bouton Microphone Vocal */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  disabled={isLoading || !isSpeechSupported}
                  className={`p-2 rounded-xl transition flex items-center justify-center cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/40 ring-2 ring-rose-400 animate-pulse'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                  } ${!isSpeechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={
                    !isSpeechSupported
                      ? "Reconnaissance vocale non disponible sur ce navigateur"
                      : isListening
                      ? "Écoute en cours... Cliquez pour arrêter la dictée"
                      : "Dicter vocalement (Reconnaissance vocale en temps réel)"
                  }
                  aria-label={isListening ? "Arrêter la dictée vocale" : "Activer la dictée vocale"}
                >
                  {isListening ? (
                    <Mic className="w-3.5 h-3.5 animate-bounce text-white" />
                  ) : (
                    <Mic className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Bouton Envoyer */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-indigo-600 transition shadow-xs cursor-pointer"
                  title="Envoyer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Propulsé par Google Gemini • Images, Fichiers & Dictée vocale
            </p>
          </footer>
        </div>
      )}

      {/* Modal Lightbox d'aperçu d'image en grand */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-rose-600 transition shadow-lg cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImageModal}
              alt="Aperçu capture d'écran"
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Bulle flottante déclencheur (Bouton d'ouverture) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
        aria-label="Discuter avec l'assistant IA"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          {hasUnreadNotification && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-ping" />
          )}
        </div>
        <span className="hidden sm:inline font-semibold text-sm">
          {isOpen ? 'Fermer l’assistant' : 'Assistant IA SkillBot'}
        </span>
        {!isOpen && (
          <span className="hidden sm:inline-flex items-center text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
            En ligne
          </span>
        )}
      </button>
    </div>
  );
}
