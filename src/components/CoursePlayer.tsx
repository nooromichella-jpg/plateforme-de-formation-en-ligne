'use client';

/**
 * Lecteur de Leçons & Quiz Intégrés (CoursePlayer.tsx)
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  PlayCircle, 
  BookOpen, 
  Clock, 
  Check,
  Brain,
  Award
} from 'lucide-react';
import { Course } from '@/src/types';
import ChapterQuizModal from '@/src/components/ChapterQuizModal';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isDark?: boolean;
}

export default function CoursePlayer({
  course,
  onBack,
  showToast,
  isDark = false,
}: CoursePlayerProps) {
  const firstLesson = course.modules?.[0]?.lessons?.[0];
  const [activeLessonId, setActiveLessonId] = useState<string>(firstLesson?.id || '');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  
  // États pour la gestion du Quiz de module
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: any; moduleTitle: string } | null>(null);
  const [passedQuizzes, setPassedQuizzes] = useState<Record<string, number>>({});

  const activeLesson = React.useMemo(() => {
    for (const mod of course.modules || []) {
      const found = mod.lessons?.find((l) => l.id === activeLessonId);
      if (found) return found;
    }
    return firstLesson;
  }, [course, activeLessonId, firstLesson]);

  const totalLessonsCount = React.useMemo(() => {
    return (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  }, [course]);

  const progressPercentage = totalLessonsCount > 0 
    ? Math.round((completedLessonIds.length / totalLessonsCount) * 100) 
    : 0;

  const toggleLessonCompleted = (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds(completedLessonIds.filter(id => id !== lessonId));
      showToast("Leçon marquée comme non lue.", "info");
    } else {
      setCompletedLessonIds([...completedLessonIds, lessonId]);
      showToast("🎉 Leçon validée avec succès !", "success");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* En-tête */}
      <header className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-2xl border transition flex items-center gap-2 text-xs font-bold cursor-pointer ${
              isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <div>
            <h1 className="font-black text-sm sm:text-base truncate max-w-md">{course.title}</h1>
            <p className="text-[11px] text-slate-400">Formateur : {course.instructor?.name || 'Expert SkillHub'}</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold">{progressPercentage}% complété</div>
            <div className="text-[10px] text-slate-400">{completedLessonIds.length} sur {totalLessonsCount} leçons</div>
          </div>
          <div className="w-32 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3">
        
        {/* Lecteur central */}
        <div className="lg:col-span-2 p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative flex items-center justify-center">
            <img 
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} 
              alt={course.title} 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider w-max mb-2">
                Leçon Active
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeLesson?.title || 'Sélectionnez une leçon'}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" /> {activeLesson?.durationMinutes || 15} minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Support pédagogique
                </span>
              </div>
            </div>
          </div>

          {/* Bouton de validation de leçon */}
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <h3 className="font-bold text-sm mb-1">Validation de la leçon</h3>
              <p className="text-xs text-slate-400">Cliquez pour enregistrer votre avancement.</p>
            </div>

            {activeLesson && (
              <button
                onClick={() => toggleLessonCompleted(activeLesson.id)}
                className={`px-6 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shadow-lg cursor-pointer ${
                  completedLessonIds.includes(activeLesson.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {completedLessonIds.includes(activeLesson.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Leçon terminée ✓</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marquer comme terminée</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Barre latérale (Modules, Leçons & Boutons de Quiz) */}
        <div className={`border-t lg:border-t-0 lg:border-l p-6 overflow-y-auto space-y-6 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-indigo-500 mb-1">
              Programme du Cours
            </h3>
            <p className="text-xs text-slate-400">{(course.modules || []).length} modules disponibles</p>
          </div>

          <div className="space-y-4">
            {(course.modules || []).map((mod, mIdx) => {
              const moduleQuiz = (mod as any).quiz; // Récupère le quiz s'il est rattaché au module
              const hasPassed = moduleQuiz && passedQuizzes[moduleQuiz.id] !== undefined;

              return (
                <div key={mod.id || mIdx} className={`rounded-2xl border overflow-hidden ${
                  isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className={`px-4 py-3 border-b font-bold text-xs flex items-center justify-between ${
                    isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-white'
                  }`}>
                    <span>Module {mIdx + 1} : {mod.title}</span>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {mod.lessons?.map((lesson) => {
                      const isSelected = lesson.id === activeLessonId;
                      const isCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full p-3 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                            isSelected 
                              ? (isDark ? 'bg-indigo-600/20 text-indigo-300' : 'bg-indigo-50 text-indigo-900 font-bold') 
                              : (isDark ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <PlayCircle className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                            )}
                            <span className="text-xs truncate">{lesson.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{lesson.durationMinutes || 10} min</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bouton pour lancer le Quiz du module s'il existe */}
                  {moduleQuiz && (
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => setActiveQuiz({ quiz: moduleQuiz, moduleTitle: mod.title })}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                          hasPassed
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {hasPassed ? <Award className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                        <span>
                          {hasPassed ? `Quiz validé (${passedQuizzes[moduleQuiz.id]}%)` : 'Lancer le Quiz du Module'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modale de Quiz affichée dynamiquement */}
      {activeQuiz && (
        <ChapterQuizModal
          quiz={activeQuiz.quiz}
          moduleTitle={activeQuiz.moduleTitle}
          courseTitle={course.title}
          isOpen={true}
          onClose={() => setActiveQuiz(null)}
          onPassQuiz={(quizId, scorePercent) => {
            setPassedQuizzes(prev => ({ ...prev, [quizId]: scorePercent }));
            showToast(`🏆 Quiz validé avec succès (${scorePercent}%) !`, "success");
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
}