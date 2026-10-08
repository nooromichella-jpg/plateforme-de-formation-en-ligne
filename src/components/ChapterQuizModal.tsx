'use client';

/**
 * Modale de Quiz Interactif (ChapterQuizModal.tsx)
 * Permet aux étudiants de passer un QCM, d'avoir la correction et un certificat de réussite.
 */

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore?: number; // Ex: 70 (%)
}

interface ChapterQuizModalProps {
  quiz: Quiz;
  moduleTitle: string;
  courseTitle: string;
  isOpen: boolean;
  isAlreadyPassed?: boolean;
  onClose: () => void;
  onPassQuiz: (quizId: string, scorePercent: number) => void;
  isDark?: boolean;
}

export default function ChapterQuizModal({
  quiz,
  moduleTitle,
  courseTitle,
  isOpen,
  isAlreadyPassed = false,
  onClose,
  onPassQuiz,
  isDark = false,
}: ChapterQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number; percent: number } | null>(null);

  if (!isOpen) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const passingScoreThreshold = quiz.passingScore || 70; // 70% par défaut pour valider

  // Sélectionner une réponse pour la question active
  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return; // On ne peut plus modifier après soumission
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  // Valider et corriger le quiz complet
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = quiz.questions.length;
    const percent = Math.round((correctCount / total) * 100);

    setScore({ correct: correctCount, total, percent });
    setIsSubmitted(true);

    // Si le score dépasse ou égale le seuil de réussite
    if (percent >= passingScoreThreshold) {
      onPassQuiz(quiz.id, percent);
    }
  };

  // Recommencer le quiz
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* En-tête */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base line-clamp-1">{quiz.title}</h3>
              <p className="text-[11px] text-slate-400">Module : {moduleTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isSubmitted ? (
            /* --- ETAPE DE QUESTIONNAIRE --- */
            <div className="space-y-6">
              {/* Barre de progression des questions */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Question {currentQuestionIndex + 1} sur {quiz.questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-bold leading-relaxed">
                  {currentQuestion.question}
                </h4>

                {/* Options de réponse */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-600/20'
                            : isDark ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-400 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boutons de navigation suivant / précédent */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs disabled:opacity-30 cursor-pointer"
                >
                  Précédent
                </button>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Soumettre le Quiz</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* --- ÉCRAN DE RÉSULTAT & CORRECTION --- */
            <div className="space-y-6 text-center py-4">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xl ring-4 ${
                score && score.percent >= passingScoreThreshold
                  ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 ring-amber-500/20'
              }`}>
                {score && score.percent >= passingScoreThreshold ? (
                  <Award className="w-10 h-10" />
                ) : (
                  <RotateCcw className="w-10 h-10" />
                )}
              </div>

              <div>
                <h4 className="text-xl font-black mb-1">
                  {score && score.percent >= passingScoreThreshold ? '🎉 Quiz Validé avec Succès !' : '⚠️ Quiz Non Validé'}
                </h4>
                <p className="text-xs text-slate-400">
                  Score obtenu : <strong className="text-indigo-500 font-bold">{score?.percent}%</strong> ({score?.correct} sur {score?.total} bonnes réponses)
                </p>
              </div>

              {/* Liste des corrections détaillées */}
              <div className="space-y-4 text-left pt-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">Correction détaillée</h5>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {quiz.questions.map((q, qIdx) => {
                    const userChoice = selectedAnswers[qIdx];
                    const isCorrect = userChoice === q.correctAnswer;

                    return (
                      <div key={q.id || qIdx} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold">Q{qIdx + 1}. {q.question}</span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Explication :</strong> {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bouton pour recommencer ou fermer */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleResetQuiz}
                  className={`flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recommencer le Quiz</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Continuer le cours</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}