'use client';

/**
 * Page de Détails d'une formation SkillHub.
 * Emplacement: src/app/course/[id]/page.tsx
 * Affiche la présentation complète, le formateur, le programme des modules,
 * et permet de s'inscrire avec synchronisation Firebase Firestore.
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Star, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  Share2, 
  Award, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Check, 
  Loader2,
  Calendar,
  Layers,
  Heart,
  UserPlus
} from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatAriaryAmount } from '@/src/lib/currency';
import { COURSES_DATA, getCourseByIdOrSlug } from '@/src/lib/coursesData';
import EnrollmentPaymentModal from '@/src/components/EnrollmentPaymentModal';
import { User } from 'firebase/auth';

interface CourseDetailsProps {
  courseId: string;
  currentUser: User | null;
  isEnrolled: boolean;
  isFavorite: boolean;
  onEnroll: (course: Course) => Promise<void>;
  onToggleFavorite: (course: Course) => void;
  onBack: () => void;
  onGoToLearningSpace?: () => void;
  onGoToRegistration?: (courseId: string) => void;
  onStartLearning?: (courseId: string) => void;
  onOpenLogin: () => void;
  coursesList?: Course[];
  isDark?: boolean;
}

export default function CourseDetailsView({
  courseId,
  currentUser,
  isEnrolled,
  isFavorite,
  onEnroll,
  onToggleFavorite,
  onBack,
  onGoToLearningSpace,
  onGoToRegistration,
  onStartLearning,
  onOpenLogin,
  coursesList,
  isDark = false,
}: CourseDetailsProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'instructor'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const found = getCourseByIdOrSlug(courseId, coursesList);
    if (found) {
      setCourse(found);
    }
  }, [courseId, coursesList]);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Formation introuvable</h2>
          <p className="text-sm text-slate-500 mb-6">
            La formation demandée ({courseId}) n’existe pas ou a été déplacée.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retourner au catalogue
          </button>
        </div>
      </div>
    );
  }

  const handleEnrollClick = async () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (isEnrolled) return;

    // Rediriger vers la page d'inscription dédiée pour compléter le formulaire et payer
    if (onGoToRegistration) {
      onGoToRegistration(course.id);
      return;
    }

    // Si la formation est payante, ouvrir la modale Mobile Money (MVola, Orange Money, Airtel Money)
    if (course.price && course.price > 0 && !course.isFree) {
      setShowPaymentModal(true);
      return;
    }

    // Inscription directe pour les formations 100% gratuites
    try {
      setIsSubmitting(true);
      await onEnroll(course);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className={`min-h-screen pb-24 font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0B0D13] text-slate-100' : 'bg-slate-50/70 text-slate-900'
    }`}>
      {/* Barre de retour supérieure */}
      <div className={`border-b sticky top-16 z-30 transition-colors duration-200 ${
        isDark ? 'bg-[#10131D] border-white/[0.08] text-slate-100' : 'bg-white border-slate-200/80 text-slate-900 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au catalogue</span>
            </button>

            {isEnrolled && onGoToLearningSpace && (
              <button
                onClick={onGoToLearningSpace}
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold transition px-3 py-1.5 rounded-xl border cursor-pointer ${
                  isDark 
                    ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20' 
                    : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 border-indigo-200'
                }`}
                title="Accéder à la page de tous vos cours inscrits"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Mon espace d'apprentissage</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(course)}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800'
                  : isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Ajouter aux favoris"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Enregistré' : 'Sauvegarder'}</span>
            </button>

            <button
              onClick={handleShare}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isDark 
                  ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Partager cette formation"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Lien copié !' : 'Partager'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero de la formation - Fond blanc moderne harmonisé */}
      <div className={`py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-[#0B0D13] border-white/[0.08] text-white' 
          : 'bg-white border-slate-200/80 text-slate-900'
      }`}>
        <div className={`absolute inset-0 pointer-events-none ${
          isDark 
            ? 'opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]' 
            : 'opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]'
        }`} />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-[11px] border ${
                isDark 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
              }`}>
                {course.category}
              </span>
              {course.badge && (
                <span className="bg-amber-500 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-[11px] shadow-2xs">
                  {course.badge}
                </span>
              )}
              <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Globe className="w-3.5 h-3.5" />
                {course.language}
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              {course.title}
            </h1>

            <p className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {course.shortDescription}
            </p>

            <div className={`flex flex-wrap items-center gap-4 text-xs sm:text-sm pt-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{course.rating}</span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>({course.reviewsCount} avis certifiés)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span>{Math.round(course.durationMinutes / 60)} heures de cours</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BookOpen className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span>{course.lessonsCount} leçons complètes</span>
              </div>
            </div>

            {/* Formateur miniature */}
            <div className={`flex items-center gap-3 pt-3 border-t ${
              isDark ? 'border-white/10' : 'border-slate-200/90'
            }`}>
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30"
              />
              <div>
                <span className={`text-xs block ${isDark ? 'text-indigo-300' : 'text-indigo-600 font-semibold'}`}>Créé par</span>
                <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>{course.instructor.name}</span>
                <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.instructor.title}</span>
              </div>
            </div>
          </div>

          {/* Carte d'inscription flottante dans le hero desktop */}
          <div className="lg:col-span-1">
            <div className={`rounded-3xl p-6 shadow-xl border transition-colors duration-200 ${
              isDark 
                ? 'bg-[#10131D] border-white/[0.08] text-slate-100 shadow-black/50' 
                : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50'
            }`}>
              <div className="aspect-video w-full rounded-2xl overflow-hidden mb-5 bg-slate-900 relative group">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                  alt={course.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Prix de la formation</span>
                  {course.isFree || course.price === 0 ? (
                    <span className="text-3xl font-black text-emerald-600">Gratuit</span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{formatPrice(course.price)}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatAriaryAmount(course.originalPrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Accès à vie
                </span>
              </div>

              {/* Bouton d'action dynamique relié à Firebase */}
              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="w-full py-3.5 px-4 bg-emerald-50 text-emerald-800 font-bold rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-sm shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Vous êtes inscrit à ce cours ! 🎉</span>
                  </div>

                  {/* Bouton vers la page étudiant contenant tous les cours inscrits */}
                  <button
                    onClick={() => {
                      if (onGoToLearningSpace) {
                        onGoToLearningSpace();
                      } else {
                        onBack();
                      }
                    }}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Voir mon espace d'apprentissage</span>
                  </button>

                  {/* Bouton pour lancer immédiatement le cours */}
                  {onStartLearning && (
                    <button
                      onClick={() => onStartLearning(course.id)}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                      <span>Suivre la formation maintenant</span>
                    </button>
                  )}

                  <button
                    onClick={onBack}
                    className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retourner au catalogue</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnrollClick}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement sur Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{course.isFree ? "S'inscrire gratuitement" : "S'inscrire à cette formation"}</span>
                    </>
                  )}
                </button>
              )}

              {!isEnrolled && onGoToRegistration && (
                <button
                  type="button"
                  onClick={() => onGoToRegistration(course.id)}
                  className="w-full mt-2 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Accéder à la page d'inscription complète</span>
                </button>
              )}

              {!currentUser && !isEnrolled && (
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  * Nécessite une connexion rapide via Google (Firebase Auth).
                </p>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Accès illimité 24/7 sur ordinateur et mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Certificat de réussite numérique inclus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Support et coaching par l'IA SkillBot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corps avec onglets et contenu détaillé */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Barre de navigation d'onglets */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Ce que vous apprendrez
              </button>
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                  activeTab === 'syllabus'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Programme ({course.modules?.length || 0} modules)
              </button>
              <button
                onClick={() => setActiveTab('instructor')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                  activeTab === 'instructor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Le formateur
              </button>
            </div>

            {/* Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Objectifs d'apprentissage */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Objectifs pédagogiques de la formation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {course.learningOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description complète */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Description détaillée</h3>
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>

                {/* Prérequis */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Prérequis recommandés</h3>
                    <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600">
                      {course.prerequisites.map((prereq, i) => (
                        <li key={i}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Programme / Syllabus */}
            {activeTab === 'syllabus' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Programme complet du cours</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course.modules?.length || 0} modules • {course.lessonsCount} chapitres • {Math.round(course.durationMinutes / 60)}h au total
                    </p>
                  </div>
                </div>

                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((mod, mIndex) => (
                    <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">{mod.title}</span>
                        <span className="text-xs text-slate-500">{mod.lessons.length} leçons</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {mod.lessons.map((lesson) => (
                          <div key={lesson.id} className="p-3.5 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50 transition">
                            <div className="flex items-center gap-3">
                              {lesson.isPreview ? (
                                <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className={lesson.isPreview ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                                {lesson.title}
                              </span>
                              {lesson.isPreview && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                                  Aperçu gratuit
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">{lesson.durationMinutes} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Le programme détaillé arrive prochainement.</p>
                )}
              </div>
            )}

            {/* Onglet Formateur */}
            {activeTab === 'instructor' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{course.instructor.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{course.instructor.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>⭐ 4.9 Note formateur</span>
                      <span>👨‍🎓 {course.instructor.studentsCount || '10,000+'} apprenants</span>
                      <span>📚 {course.instructor.coursesCount || '3'} formations</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-4 border-t border-slate-100">
                  {course.instructor.bio || "Formateur expert du secteur tech, passionné par la transmission des compétences et l'apprentissage appliqué."}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale de réassurance */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Garantie SkillHub
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toutes nos formations sont auditées pour répondre aux exigences des recruteurs et intègrent un suivi interactif avec notre IA d’assistance pédagogique.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-indigo-600 font-semibold">
                <Award className="w-4 h-4" />
                <span>Certification reconnue sur le profil</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-3xl p-6 border border-indigo-200/80 space-y-3">
              <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Besoin d’aide pour choisir ?
              </h4>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                Utilisez notre bulle d’assistance IA en bas à droite. SkillBot peut vous conseiller sur les prérequis et l'adéquation de ce cours avec votre projet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de Paiement Mobile Money (MVola, Orange Money, Airtel Money) */}
      <EnrollmentPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        currentUser={currentUser}
        onConfirmEnrollment={async (c) => {
          await onEnroll(c);
        }}
        onGoToLearningSpace={onGoToLearningSpace}
        onStartLearning={onStartLearning}
      />
    </div>
  );
}
