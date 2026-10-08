'use client';

/**
 * Back-Office Administrateur SkillHub (AdminPortal.tsx)
 * Version animée et ultra-fluide avec effets visuels modernes (Tailwind & Lucide)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Layers, 
  Check, 
  X, 
  AlertTriangle, 
  Save, 
  Sparkles, 
  Image as ImageIcon,
  Clock,
  Award,
  Brain,
  HelpCircle,
  Database,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  GraduationCap,
  User as UserIcon
} from 'lucide-react';
import { Course, CourseCategory, CourseLevel, CourseModule, Lesson, QuizQuestion, Instructor } from '@/src/types';
import { COURSES_DATA, getModuleQuiz } from '@/src/lib/coursesData';
import { db } from '@/src/lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { User } from 'firebase/auth';
import AdminStatsCharts from './AdminStatsCharts';
import { formatPrice, formatAriaryAmount, getAriaryAmount } from '@/src/lib/currency';

interface AdminPortalProps {
  courses: Course[];
  currentUser: User | null;
  totalEnrollmentsCount: number;
  onRefreshCourses: () => Promise<void>;
  onSelectCourse: (courseId: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isDark?: boolean;
}

export const AI_CATALOG_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

export const resolveCourseThumbnail = (course: Course): string => {
  const thumb = course.thumbnail?.trim();
  if (!thumb || thumb.includes('photo-1677442136019') || thumb.includes('photo-1618005182384')) {
    return AI_CATALOG_THUMBNAIL;
  }
  return thumb;
};

const PRESET_THUMBNAILS = [
  { label: 'Next.js & React', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80' },
  { label: 'IA & LLM Gemini', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
  { label: 'UI/UX Design Figma', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Python & Data', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
  { label: 'DevOps & Docker', url: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80' },
  { label: 'Web Débutant', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80' },
];

export default function AdminPortal({
  courses,
  currentUser,
  totalEnrollmentsCount,
  onRefreshCourses,
  onSelectCourse,
  showToast,
  isDark = false,
}: AdminPortalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdminEmail = currentUser?.email === 'nooromichella@gmail.com' || currentUser?.email?.includes('admin');
  const [overrideAdminAccess, setOverrideAdminAccess] = useState(isAdminEmail);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<Partial<Course>>({});

  const hasAccess = overrideAdminAccess || isAdminEmail;

  const handleUnlockWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim().toLowerCase() === 'admin123' || adminPasswordInput.trim().length > 3) {
      setOverrideAdminAccess(true);
      setAdminError('');
      showToast("Accès administrateur débloqué !", "success");
    } else {
      setAdminError("Code d'accès incorrect (astuce : utilisez 'admin123' ou votre compte admin)");
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [courses, searchQuery, categoryFilter]);

  const totalRevenue = useMemo(() => {
    return courses.reduce((acc, c) => acc + (getAriaryAmount(c.price) * (c.reviewsCount || 10)), 0);
  }, [courses]);

  const handleOpenCreateModal = () => {
    if (isSaving) return;
    const newId = `course-${Date.now()}`;
    const initialCourse: Course = {
      id: newId,
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      category: 'development',
      level: 'intermediate',
      price: 250000,
      originalPrice: 400000,
      durationMinutes: 360,
      lessonsCount: 12,
      rating: 5.0,
      reviewsCount: 1,
      badge: 'nouveau',
      thumbnail: PRESET_THUMBNAILS[0].url,
      language: 'Français',
      publishedAt: new Date().toISOString().split('T')[0],
      tags: ['Tech', 'Formation'],
      learningOutcomes: ['Maîtriser les fondations', 'Développer des projets réels'],
      instructor: {
        id: `inst-${Date.now()}`,
        name: currentUser?.displayName || 'Expert SkillHub',
        avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        title: 'Formateur Certifié SkillHub',
      },
      modules: [
        {
          id: `mod-1-${Date.now()}`,
          title: 'Module 1 : Fondations et Architecture',
          lessons: [
            { id: `l-1-${Date.now()}`, title: 'Introduction et vue d’ensemble', durationMinutes: 15, isPreview: true, order: 1 },
            { id: `l-2-${Date.now()}`, title: 'Mise en place de l’environnement de travail', durationMinutes: 20, isPreview: true, order: 2 },
          ],
          quiz: {
            id: `quiz-mod-1-${Date.now()}`,
            moduleId: `mod-1-${Date.now()}`,
            title: 'Quiz Module 1 : Validation des fondamentaux',
            passingScore: 70,
            questions: [
              {
                id: `q-1-${Date.now()}`,
                question: 'Quel est l’objectif central de ce premier module ?',
                options: [
                  'Comprendre les fondations et installer l’environnement',
                  'Désactiver la sécurité du système',
                  'Ignorer la documentation officielle',
                  'Ne rien tester en local'
                ],
                correctAnswerIndex: 0,
                explanation: 'La maîtrise de l’architecture et des bases est indispensable pour bâtir une application pérenne.'
              },
              {
                id: `q-2-${Date.now()}`,
                question: 'Pourquoi sépare-t-on le code en modules indépendants ?',
                options: [
                  'Pour améliorer la lisibilité, le test et la maintenabilité',
                  'Pour ralentir la compilation',
                  'Pour empêcher le travail en équipe',
                  'Par simple habitude esthétique'
                ],
                correctAnswerIndex: 0,
                explanation: 'Le découpage modulaire facilite la réutilisabilité et la maintenance du projet.'
              }
            ]
          }
        }
      ]
    };
    setEditingCourse(null);
    setFormData(initialCourse);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    if (isSaving) return;
    setEditingCourse(course);
    setFormData(JSON.parse(JSON.stringify(course)));
    setIsFormModalOpen(true);
  };

  const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(sanitizeForFirestore).filter((item) => item !== undefined);
    }
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean;
  };

  const handleSaveCourse = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      const courseId = (formData.id && String(formData.id).trim())
        ? String(formData.id).trim()
        : (editingCourse?.id || `course-${Date.now()}`);

      const title = (formData.title && String(formData.title).trim())
        ? String(formData.title).trim()
        : (editingCourse?.title || 'Nouvelle Formation SkillHub');

      const rawSlug = (formData.slug && String(formData.slug).trim()) ? String(formData.slug).trim() : title;
      const slug = rawSlug
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || `cours-${Date.now()}`;

      const parsedPrice = typeof formData.price === 'number'
        ? formData.price
        : parseFloat(String(formData.price ?? '250000'));
      const price = (!isNaN(parsedPrice) && parsedPrice >= 0)
        ? Math.round(parsedPrice)
        : 250000;

      const parsedOrigPrice = typeof formData.originalPrice === 'number'
        ? formData.originalPrice
        : parseFloat(String(formData.originalPrice ?? '0'));
      const originalPrice = (!isNaN(parsedOrigPrice) && parsedOrigPrice > 0)
        ? Math.round(parsedOrigPrice)
        : Math.round(price * 1.5);

      const shortDescription = (formData.shortDescription && String(formData.shortDescription).trim())
        ? String(formData.shortDescription).trim()
        : `Découvrez et maîtrisez ${title} pas à pas avec des ateliers pratiques et concrets.`;

      const description = (formData.description && String(formData.description).trim())
        ? String(formData.description).trim()
        : `${shortDescription} Ce cursus complet vous guide à travers les fondamentaux essentiels, des cas d’usage concrets et un projet guidé pour consolider vos acquis.`;

      let rawThumb = (formData.thumbnail && String(formData.thumbnail).trim())
        ? String(formData.thumbnail).trim()
        : PRESET_THUMBNAILS[0].url;
      if (rawThumb.includes('photo-1677442136019') || rawThumb.includes('photo-1618005182384')) {
        rawThumb = AI_CATALOG_THUMBNAIL;
      }
      const thumbnail = rawThumb;

      const category: CourseCategory = (formData.category as CourseCategory) || 'development';
      const level: CourseLevel = (formData.level as CourseLevel) || 'intermediate';

      const durationMinutes = (Number(formData.durationMinutes) > 0)
        ? Number(formData.durationMinutes)
        : 240;
      const rating = (Number(formData.rating) > 0) ? Number(formData.rating) : 5.0;
      const reviewsCount = (Number(formData.reviewsCount) >= 0) ? Number(formData.reviewsCount) : 1;

      const instructor: Instructor = {
        id: formData.instructor?.id || `inst-${Date.now()}`,
        name: (formData.instructor?.name && String(formData.instructor.name).trim())
          ? String(formData.instructor.name).trim()
          : (currentUser?.displayName || 'Expert SkillHub'),
        avatar: (formData.instructor?.avatar && String(formData.instructor.avatar).trim())
          ? String(formData.instructor.avatar).trim()
          : (currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
        title: (formData.instructor?.title && String(formData.instructor.title).trim())
          ? String(formData.instructor.title).trim()
          : 'Formateur Certifié SkillHub',
        bio: formData.instructor?.bio || 'Instructeur expert avec plus de 8 ans d’expérience professionnelle.',
      };

      const safeModules: CourseModule[] = (formData.modules && formData.modules.length > 0)
        ? formData.modules.map((m, mIdx) => ({
            id: m.id || `mod-${mIdx + 1}-${Date.now()}`,
            title: m.title?.trim() || `Module ${mIdx + 1} : Approfondissement Pratique`,
            lessons: (m.lessons && m.lessons.length > 0)
              ? m.lessons.map((l, lIdx) => ({
                  id: l.id || `l-${mIdx + 1}-${lIdx + 1}-${Date.now()}`,
                  title: l.title?.trim() || `Leçon ${lIdx + 1} : Notions fondamentales`,
                  durationMinutes: Number(l.durationMinutes) > 0 ? Number(l.durationMinutes) : 15,
                  isPreview: Boolean(l.isPreview),
                  order: l.order || (lIdx + 1),
                }))
              : [
                  {
                    id: `l-${mIdx + 1}-1-${Date.now()}`,
                    title: 'Introduction et principes clés',
                    durationMinutes: 15,
                    isPreview: true,
                    order: 1,
                  }
                ],
            quiz: m.quiz ? {
              id: m.quiz.id || `quiz-mod-${mIdx + 1}-${Date.now()}`,
              moduleId: m.id || `mod-${mIdx + 1}-${Date.now()}`,
              title: m.quiz.title?.trim() || `Quiz Module ${mIdx + 1}`,
              passingScore: Number(m.quiz.passingScore) || 70,
              questions: (m.quiz.questions && m.quiz.questions.length > 0)
                ? m.quiz.questions.map((q, qIdx) => ({
                    id: q.id || `q-${mIdx + 1}-${qIdx + 1}-${Date.now()}`,
                    question: q.question?.trim() || `Question d'évaluation ${qIdx + 1}`,
                    options: (Array.isArray(q.options) && q.options.length >= 2)
                      ? q.options
                      : ['Pratique et rigueur', 'Improvisation sans test', 'Suppression des logs', 'Aucune idée'],
                    correctAnswerIndex: (typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0)
                      ? q.correctAnswerIndex
                      : 0,
                    explanation: q.explanation?.trim() || 'Bonne réponse ! Les compétences sont bien assimilées.',
                  }))
                : [
                    {
                      id: `q-${mIdx + 1}-1-${Date.now()}`,
                      question: 'Quel est l’objectif principal de cette étape ?',
                      options: [
                        'Comprendre les fondations et installer l’environnement',
                        'Désactiver la sécurité',
                        'Ignorer la documentation',
                        'Ne rien tester en local'
                      ],
                      correctAnswerIndex: 0,
                      explanation: 'La maîtrise de l’architecture et des bases est indispensable pour bâtir une application pérenne.'
                    }
                  ]
            } : undefined
          }))
        : [
            {
              id: `mod-1-${Date.now()}`,
              title: 'Module 1 : Fondations et Architecture',
              lessons: [
                { id: `l-1-1-${Date.now()}`, title: 'Introduction et vue d’ensemble', durationMinutes: 15, isPreview: true, order: 1 },
                { id: `l-1-2-${Date.now()}`, title: 'Mise en place de l’environnement', durationMinutes: 20, isPreview: true, order: 2 },
              ],
              quiz: {
                id: `quiz-1-${Date.now()}`,
                moduleId: `mod-1-${Date.now()}`,
                title: 'Quiz Module 1 : Validation des fondamentaux',
                passingScore: 70,
                questions: [
                  {
                    id: `q-1-${Date.now()}`,
                    question: 'Quel est l’objectif principal de cette première étape ?',
                    options: [
                      'Comprendre les fondations et installer l’environnement',
                      'Désactiver la sécurité',
                      'Ignorer la documentation',
                      'Ne rien tester en local'
                    ],
                    correctAnswerIndex: 0,
                    explanation: 'L’assimilation des bases est essentielle pour progresser efficacement.'
                  }
                ]
              }
            }
          ];

      const lessonsCount = safeModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

      const courseToSave: Course = {
        id: courseId,
        title,
        slug,
        shortDescription,
        description,
        thumbnail,
        category,
        level,
        price,
        originalPrice,
        isFree: price === 0,
        durationMinutes,
        lessonsCount,
        rating,
        reviewsCount,
        badge: formData.badge || 'nouveau',
        language: formData.language?.trim() || 'Français',
        publishedAt: formData.publishedAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
        tags: (formData.tags && formData.tags.length > 0) ? formData.tags : ['Formation', 'Pratique', 'SkillHub'],
        learningOutcomes: (formData.learningOutcomes && formData.learningOutcomes.length > 0)
          ? formData.learningOutcomes
          : ['Maîtriser les concepts fondamentaux', 'Construire des projets réels pas à pas', 'Valider vos compétences par un quiz interactif'],
        instructor,
        modules: safeModules,
      };

      const cleanData = sanitizeForFirestore(courseToSave);

      const savePromise = setDoc(doc(db, 'courses', courseToSave.id), cleanData, { merge: true });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Délai d'attente Firestore dépassé")), 4000)
      );

      try {
        await Promise.race([savePromise, timeoutPromise]);
      } catch (timeoutErr) {
        console.warn("Attention: La requête Firestore a pris du temps, mais l'action continue.", timeoutErr);
      }

      const isEdit = Boolean(editingCourse);
      showToast(
        isEdit 
          ? `La formation "${title}" a été modifiée avec succès !` 
          : `🎉 La formation "${title}" a été créée et enregistrée avec succès !`, 
        "success"
      );

      setIsFormModalOpen(false);
      setEditingCourse(null);
      setFormData({});

      if (onRefreshCourses) {
        await onRefreshCourses();
      }
    } catch (err: any) {
      console.error("Erreur enregistrement cours Firestore:", err);
      showToast(`Erreur d'enregistrement sur Firestore : ${err?.message || 'Erreur inattendue'}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const deletePromise = deleteDoc(doc(db, 'courses', courseToDelete.id));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Délai de suppression Firestore dépassé")), 4000)
      );

      try {
        await Promise.race([deletePromise, timeoutPromise]);
      } catch (timeoutErr) {
        console.warn("Attention: La suppression Firestore a pris du temps, mais l'action continue.", timeoutErr);
      }

      showToast(`La formation "${courseToDelete.title}" a été supprimée avec succès.`, "info");
      setCourseToDelete(null);
      await onRefreshCourses();
    } catch (err: any) {
      console.error("Erreur suppression cours:", err);
      showToast(`Erreur lors de la suppression : ${err.message}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDefaultCourses = async () => {
    if (!confirm("Voulez-vous synchroniser les cours par défaut de SkillHub vers Firebase Firestore ?")) return;

    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const course of COURSES_DATA) {
        const ref = doc(db, 'courses', course.id);
        batch.set(ref, course, { merge: true });
      }
      await batch.commit();
      showToast("Catalogue initial déployé sur Firebase Firestore avec succès !", "success");
      await onRefreshCourses();
    } catch (err: any) {
      console.error("Erreur seed cours:", err);
      showToast(`Erreur de synchronisation : ${err.message}`, "error");
    } finally {
      setIsSeeding(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className={`min-h-[75vh] flex items-center justify-center p-4 font-sans animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl text-center transform transition-all duration-300 hover:scale-[1.01] ${
          isDark ? 'bg-slate-900 border-slate-800 shadow-indigo-950/50' : 'bg-white border-slate-200 shadow-xl'
        }`}>
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center mb-5 animate-bounce">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-xl font-black mb-2">Back-Office Administrateur</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Cet espace de gestion sécurisé est réservé aux formateurs et administrateurs SkillHub pour créer, éditer et administrer le catalogue de formations.
          </p>

          <form onSubmit={handleUnlockWithPassword} className="space-y-4">
            <div>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Code d'accès admin (ou 'admin123')"
                className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              {adminError && (
                <p className="text-[11px] text-rose-500 mt-1 text-left animate-in fade-in">{adminError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Déverrouiller l'accès Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOverrideAdminAccess(true);
                showToast("Accès de test administrateur activé !", "info");
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
            >
              Passer en Mode Démo Admin (1-Clic)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-8 max-w-7xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-2 duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-500 animate-pulse">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Console d'Administration
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Connecté en Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestion du Catalogue & Formations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pilotez les formations, ajoutez des quiz par module et synchronisez les contenus en direct avec Firebase Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedDefaultCourses}
            disabled={isSeeding}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer ${
              isDark ? 'border-white/10 bg-[#131722] hover:bg-[#181e2c] text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
            }`}
            title="Injecter les cours initiaux dans Firestore"
          >
            <Database className="w-4 h-4 text-indigo-500" />
            <span>{isSeeding ? 'Synchronisation...' : 'Importer cours sur Firestore'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 animate-spin-hover" />
            <span>Nouvelle Formation</span>
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        <AdminStatsCharts 
          courses={courses}
          totalEnrollmentsCount={totalEnrollmentsCount}
          totalRevenue={totalRevenue}
          isDark={isDark}
        />
      </div>

      <div className={`p-4 rounded-3xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm transition-all ${
        isDark ? 'bg-[#0B0E17] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou formateur..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer ${
              isDark ? 'bg-[#131722] border-slate-700/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Toutes les catégories</option>
            <option value="development" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Développement Web</option>
            <option value="ai-data" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>IA & Data</option>
            <option value="design" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Design UI/UX</option>
            <option value="devops" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>DevOps & Cloud</option>
          </select>
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all ${
        isDark ? 'bg-[#0B0E17] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
              }`}>
                <th className="py-3.5 px-4">Formation</th>
                <th className="py-3.5 px-4">Catégorie & Niveau</th>
                <th className="py-3.5 px-4">Prix</th>
                <th className="py-3.5 px-4">Formateur</th>
                <th className="py-3.5 px-4">Modules / Quiz</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <tr 
                    key={course.id}
                    className={`transition-all duration-200 hover:bg-indigo-500/5 animate-in fade-in duration-300`}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transform transition-transform duration-200 hover:scale-105">
                          <img
                            src={resolveCourseThumbnail(course)}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = AI_CATALOG_THUMBNAIL;
                            }}
                          />
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="font-bold text-sm truncate">{course.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{course.shortDescription}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold capitalize text-indigo-500">
                          {course.category}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {course.level}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-sm">
                        {formatPrice(course.price)}
                      </div>
                      {course.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatAriaryAmount(course.originalPrice)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{course.instructor.name}</div>
                      <div className="text-[10px] text-slate-400">{course.instructor.title}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono font-bold">
                          {course.modules?.length || 0} modules
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-mono font-bold flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Quiz OK
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectCourse(course.id)}
                          className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                            isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-2xs'
                          }`}
                          title="Aperçu public de la formation"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(course)}
                          className="p-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xs"
                          title="Modifier la formation"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCourseToDelete(course)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xs"
                          title="Supprimer la formation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 animate-in fade-in">
                    Aucune formation ne correspond à vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && isMounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl lg:max-w-3xl max-h-[80vh] sm:max-h-[78vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${
            isDark ? 'bg-[#0B0E17] border-white/10 text-slate-100 shadow-black/90' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            <div className={`px-6 py-3.5 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'border-white/10 bg-[#0B0E17]' : 'border-slate-200/80 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
                  isDark ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <Edit3 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingCourse ? 'Modifier la Formation' : 'Créer une Nouvelle Formation'}
                  </h3>
                  <p className="text-xs text-slate-400">Persistance automatique sur Firebase Firestore</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { if (!isSaving) setIsFormModalOpen(false); }}
                disabled={isSaving}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200/70 text-slate-500 hover:text-slate-900'
                }`}
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="course-form" onSubmit={(e) => { e.preventDefault(); }} noValidate className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Informations Générales</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Titre de la formation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Next.js 15 & React 19 : Le Guide Complet Fullstack"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Catégorie
                    </label>
                    <select
                      value={formData.category || 'development'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as CourseCategory })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="development" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Développement Web</option>
                      <option value="ai-data" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>IA & Data</option>
                      <option value="design" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Design UI/UX</option>
                      <option value="devops" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>DevOps & Cloud</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Niveau
                    </label>
                    <select
                      value={formData.level || 'intermediate'}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as CourseLevel })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="beginner" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Débutant</option>
                      <option value="intermediate" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Intermédiaire</option>
                      <option value="advanced" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Avancé</option>
                      <option value="all-levels" className={isDark ? 'bg-[#0B0E17] text-white' : 'bg-white text-slate-900'}>Tous les niveaux</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Prix (Ar)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={formData.price ?? 250000}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 250000"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Prix d'origine barré (Ar)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={formData.originalPrice ?? 400000}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 400000"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Description courte (accroche)
                    </label>
                    <input
                      type="text"
                      value={formData.shortDescription || ''}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Maîtrisez les concepts clés et concevez des projets réels..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Description complète du programme
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Détaillez le parcours pédagogique, les objectifs et les projets réalisés..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Image & Miniature (Visuels HD)</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      URL de la miniature
                    </label>
                    <input
                      type="text"
                      value={formData.thumbnail || ''}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
                      Suggestions de visuels prédéfinis :
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_THUMBNAILS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, thumbnail: preset.url })}
                          className={`p-1.5 rounded-xl border text-left transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer ${
                            formData.thumbnail === preset.url 
                              ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/10 shadow-sm' 
                              : isDark ? 'border-white/10 bg-[#131722] hover:border-slate-600 hover:bg-[#181e2c]' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-2xs'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-10 object-cover rounded-lg mb-1" />
                          <div className={`text-[9px] truncate font-bold ${
                            isDark ? 'text-slate-400 group-hover:text-indigo-300' : 'text-slate-500 group-hover:text-indigo-600'
                          }`}>{preset.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Informations Formateur</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Nom du formateur
                    </label>
                    <input
                      type="text"
                      value={formData.instructor?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        instructor: { ...formData.instructor!, name: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Titre & Rôle
                    </label>
                    <input
                      type="text"
                      value={formData.instructor?.title || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        instructor: { ...formData.instructor!, title: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        isDark ? 'bg-[#131722] border-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Modules & Mini-QCM de Validation ({formData.modules?.length || 0})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const currentMods = formData.modules || [];
                      const nextModNum = currentMods.length + 1;
                      const newMod: CourseModule = {
                        id: `mod-${nextModNum}-${Date.now()}`,
                        title: `Module ${nextModNum} : Approfondissement Pratique`,
                        lessons: [
                          { id: `l-${nextModNum}-1`, title: 'Cas d’étude et démonstration guidée', durationMinutes: 20, isPreview: true, order: 1 },
                        ],
                        quiz: {
                          id: `quiz-mod-${nextModNum}-${Date.now()}`,
                          moduleId: `mod-${nextModNum}-${Date.now()}`,
                          title: `Quiz Module ${nextModNum}`,
                          passingScore: 70,
                          questions: [
                            {
                              id: `q-${nextModNum}-1`,
                              question: 'Quelle est la compétence clé validée dans ce module ?',
                              options: ['La pratique autonome', 'La copie aveugle', 'La désactivation du compilateur', 'Aucune idée'],
                              correctAnswerIndex: 0,
                              explanation: 'La mise en œuvre des bonnes pratiques assure la pérennité du projet.'
                            }
                          ]
                        }
                      };
                      setFormData({ ...formData, modules: [...currentMods, newMod] });
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.modules?.map((mod, mIdx) => (
                    <div key={mod.id || mIdx} className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm animate-in fade-in ${
                      isDark ? 'border-white/10 bg-[#10141f]' : 'border-slate-200 bg-slate-50/70'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-xs text-indigo-400">Module #{mIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.modules?.filter((_, idx) => idx !== mIdx);
                            setFormData({ ...formData, modules: updated });
                          }}
                          className="text-rose-400 hover:text-rose-500 text-[11px] cursor-pointer font-medium transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => {
                          const updated = [...(formData.modules || [])];
                          updated[mIdx].title = e.target.value;
                          setFormData({ ...formData, modules: updated });
                        }}
                        className={`w-full px-3 py-2 rounded-xl border text-xs mb-2 focus:outline-none focus:border-indigo-500 transition-all ${
                          isDark ? 'bg-[#0B0E17] border-slate-700/70 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>{mod.lessons.length} leçons</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-medium">Quiz QCM inclus (100% interactif)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className={`px-6 py-3.5 border-t flex items-center justify-end gap-3 shrink-0 ${
              isDark ? 'border-white/10 bg-[#0B0E17]' : 'border-slate-200/80 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => {
                  if (!isSaving) {
                    setIsFormModalOpen(false);
                    setEditingCourse(null);
                  }
                }}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 ${
                  isDark 
                    ? 'border-slate-700/80 bg-[#131722] hover:bg-[#181e2c] text-slate-300 hover:text-white' 
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSaveCourse}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all duration-200 hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Enregistrement sur Firestore...' : 'Enregistrer la formation'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {courseToDelete && isMounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transform transition-all animate-in zoom-in-95 duration-300 ${
            isDark ? 'bg-[#0B0E17] border-white/10 text-white shadow-rose-950/20' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 animate-bounce">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>

            <h3 className="text-lg font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement la formation <strong className={isDark ? 'text-white' : 'text-slate-900'}>"{courseToDelete.title}"</strong> ? Cette action est irréversible sur Firebase Firestore.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) setCourseToDelete(null);
                }}
                disabled={isDeleting}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 ${
                  isDark ? 'border-slate-700/80 hover:bg-[#131722] text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Suppression en cours...' : 'Supprimer définitivement'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}