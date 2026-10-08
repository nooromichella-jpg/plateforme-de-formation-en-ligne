'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  BookOpen, 
  PlayCircle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  Check, 
  Loader2, 
  AlertCircle,
  Award,
  ChevronDown,
  ArrowLeft,
  Lock,
  Globe
} from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatAriaryAmount } from '@/src/lib/currency';
import { User } from 'firebase/auth';

interface StudentRegistrationPageProps {
  courses: Course[];
  enrolledCourseIds: string[];
  initialCourseId?: string | null;
  currentUser: User | any | null;
  onEnrollCourse: (course: Course, studentInfo?: { name?: string; email?: string; phone?: string }) => Promise<void>;
  onGoToLearningSpace: () => void;
  onStartLearning: (courseId: string) => void;
  onOpenAuthModal: (reason?: string) => void;
  onBackToCatalog?: () => void;
  isDark?: boolean;
}

type Operator = 'mvola' | 'orange' | 'airtel';

interface OperatorOption {
  id: Operator;
  name: string;
  badge: string;
  brandColor: string;
  defaultPrefix: string;
  helper: string;
}

const OPERATORS: OperatorOption[] = [
  {
    id: 'mvola',
    name: 'MVola (Telma)',
    badge: 'N°1 à Mada',
    brandColor: '#F59E0B',
    defaultPrefix: '034',
    helper: '034 ou 038',
  },
  {
    id: 'orange',
    name: 'Orange Money',
    badge: 'Orange Mada',
    brandColor: '#F97316',
    defaultPrefix: '032',
    helper: '032',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    badge: 'Airtel Mada',
    brandColor: '#EF4444',
    defaultPrefix: '033',
    helper: '033',
  },
];

export default function StudentRegistrationPage({
  courses,
  enrolledCourseIds,
  initialCourseId,
  currentUser,
  onEnrollCourse,
  onGoToLearningSpace,
  onStartLearning,
  onOpenAuthModal,
  onBackToCatalog,
  isDark = false,
}: StudentRegistrationPageProps) {
  // Sélection de la formation
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (initialCourseId && courses.some((c) => c.id === initialCourseId)) {
      return initialCourseId;
    }
    return courses[0]?.id || '';
  });

  // Possibilité de changer de cours via sélecteur compact
  const [isChangingCourse, setIsChangingCourse] = useState(false);

  // Données de l'étudiant
  const [studentName, setStudentName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillhub_preferred_student_name');
      if (saved) return saved;
    }
    return currentUser?.displayName || '';
  });
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [studentPhone, setStudentPhone] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator>('mvola');

  // États de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [confirmedCourse, setConfirmedCourse] = useState<Course | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');

  // Synchronisation avec l'utilisateur connecté
  useEffect(() => {
    if (currentUser) {
      if (!studentName) {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('skillhub_preferred_student_name') : null;
        if (saved) {
          setStudentName(saved);
        } else if (currentUser.displayName) {
          setStudentName(currentUser.displayName);
        }
      }
      if (!studentEmail && currentUser.email) setStudentEmail(currentUser.email);
    }
  }, [currentUser]);

  // Si l'initialCourseId change depuis les props
  useEffect(() => {
    if (initialCourseId && courses.some((c) => c.id === initialCourseId)) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId, courses]);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const isAlreadyEnrolled = currentCourse ? enrolledCourseIds.includes(currentCourse.id) : false;
  const isPaidCourse = currentCourse ? (currentCourse.price > 0 && !currentCourse.isFree) : false;
  const currentOp = OPERATORS.find((o) => o.id === selectedOperator) || OPERATORS[0];

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setStudentPhone(cleaned);
    setErrorMessage(null);

    if (cleaned.startsWith('034') || cleaned.startsWith('038')) {
      setSelectedOperator('mvola');
    } else if (cleaned.startsWith('032')) {
      setSelectedOperator('orange');
    } else if (cleaned.startsWith('033')) {
      setSelectedOperator('airtel');
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse) return;

    if (!currentUser) {
      onOpenAuthModal(`Connectez-vous pour valider votre inscription à la formation "${currentCourse.title}".`);
      return;
    }

    if (isAlreadyEnrolled) {
      // Si l'étudiant est déjà inscrit, on met à jour son nom officiel sur le certificat sans lui redemander de payer
      setIsSubmitting(true);
      setProcessingStatus('Mise à jour du nom sur votre certificat pour cette formation...');
      try {
        await onEnrollCourse(currentCourse, {
          name: studentName.trim(),
          email: studentEmail.trim(),
          phone: studentPhone.trim(),
        });
        setConfirmedCourse(currentCourse);
        setRegistrationSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        console.error('Erreur mise à jour inscription:', err);
        setErrorMessage(err.message || "Une erreur est survenue lors de la mise à jour du nom.");
      } finally {
        setIsSubmitting(false);
        setProcessingStatus('');
      }
      return;
    }

    if (isPaidCourse && (!studentPhone || studentPhone.length < 9)) {
      setErrorMessage('Veuillez renseigner un numéro Mobile Money valide (ex: 034 12 345 67).');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const generatedRef = `SKH-${selectedOperator.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(generatedRef);

      if (isPaidCourse) {
        setProcessingStatus(`Connexion au réseau ${currentOp.name}...`);
        await new Promise((res) => setTimeout(res, 600));

        setProcessingStatus(`Débit de ${formatPrice(currentCourse.price)} en cours au ${studentPhone}...`);
        await new Promise((res) => setTimeout(res, 900));
      } else {
        setProcessingStatus('Enregistrement de votre inscription gratuite...');
        await new Promise((res) => setTimeout(res, 500));
      }

      setProcessingStatus('Synchronisation avec votre compte étudiant...');
      await onEnrollCourse(currentCourse, {
        name: studentName.trim(),
        email: studentEmail.trim(),
        phone: studentPhone.trim(),
      });

      setConfirmedCourse(currentCourse);
      setRegistrationSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setErrorMessage(err.message || "Une erreur est survenue lors de l'enregistrement de votre inscription.");
    } finally {
      setIsSubmitting(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      <div className="max-w-2xl mx-auto">
        {/* Navigation retour supérieure */}
        {onBackToCatalog && (
          <div className="mb-6">
            <button
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner au catalogue de formations</span>
            </button>
          </div>
        )}

        {/* En-tête de la Page d'Inscription */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2.5 text-xs font-mono tracking-wider uppercase text-indigo-500 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Formulaire d'Inscription Officiel</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Inscription & Règlement de la Formation
          </h1>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Complétez vos coordonnées d'apprenant pour valider votre place et commencer vos cours.
          </p>
        </div>

        {/* ÉCRAN DE SUCCÈS APRÈS VALIDATION */}
        {registrationSuccess && confirmedCourse ? (
          <div className={`p-8 sm:p-10 rounded-3xl border text-center shadow-xl animate-in zoom-in-95 duration-300 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-2">
              Inscription validée avec succès 🎉
            </div>

            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Félicitations, vous êtes inscrit !
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Votre inscription à la formation <strong>« {confirmedCourse.title} »</strong> est maintenant active.
            </p>

            {/* Reçu détaillé */}
            <div className={`mt-6 p-4 rounded-2xl border text-left text-xs space-y-2.5 ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Numéro de référence :</span>
                <span className="font-mono font-bold text-indigo-600">{transactionRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Étudiant :</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {studentName || currentUser?.displayName || currentUser?.email || 'Apprenant SkillHub'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Formation choisie :</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[260px]">
                  {confirmedCourse.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Montant réglé :</span>
                <span className="font-bold text-emerald-600">
                  {confirmedCourse.isFree ? '100% Gratuit' : formatPrice(confirmedCourse.price)}
                </span>
              </div>
              {confirmedCourse.price > 0 && !confirmedCourse.isFree && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mode de paiement :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentOp.name} ({studentPhone})
                  </span>
                </div>
              )}
            </div>

            {/* Boutons d'Action Distincts : Espace d'apprentissage VS Démarrer le cours */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onGoToLearningSpace}
                className="py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Voir mon espace d'apprentissage</span>
              </button>

              <button
                type="button"
                onClick={() => onStartLearning(confirmedCourse.id)}
                className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Commencer ce cours maintenant</span>
              </button>
            </div>

            <div className="mt-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccess(false);
                  setConfirmedCourse(null);
                }}
                className="text-xs text-slate-500 hover:text-indigo-600 transition"
              >
                Inscrire une autre formation
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAIRE UNIQUE CENTRÉ & ÉPURÉ (SANS LA GRANDE COLONNE DE GAUCHE) */
          <div className="space-y-6">
            {/* 1. CARTE RÉCAPITULATIVE DE LA FORMATION CHOISIE */}
            {currentCourse && (
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all ${
                isDark ? 'bg-[#10131E] border-white/[0.08] shadow-xl shadow-black/30' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={currentCourse.thumbnail}
                      alt={currentCourse.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                          {currentCourse.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {currentCourse.level}
                        </span>
                      </div>
                      <h2 className={`text-sm sm:text-base font-bold truncate ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {currentCourse.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Par {currentCourse.instructor.name} • {Math.round(currentCourse.durationMinutes / 60)}h de formation
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-xl font-black text-indigo-600">
                      {currentCourse.isFree ? (
                        <span className="text-emerald-600">100% Gratuit</span>
                      ) : (
                        formatPrice(currentCourse.price)
                      )}
                    </div>
                    {currentCourse.originalPrice && (
                      <div className="text-[11px] text-slate-400 line-through">
                        {formatAriaryAmount(currentCourse.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton pour changer de formation facilement si besoin */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Vous souhaitez inscrire un autre cours ?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingCourse(!isChangingCourse)}
                    className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isChangingCourse ? 'Masquer la liste' : 'Changer de cours'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isChangingCourse ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Sélecteur déroulant compact si l'étudiant souhaite changer */}
                {isChangingCourse && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Sélectionnez une formation du catalogue :
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {courses.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCourseId(c.id);
                            setIsChangingCourse(false);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                            c.id === selectedCourseId
                              ? isDark
                                ? 'border-indigo-500 bg-indigo-950/40 font-bold text-indigo-300'
                                : 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700'
                              : isDark
                                ? 'border-white/10 bg-[#141724] hover:bg-[#1a1e2e] text-slate-300'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate mr-2">{c.title}</span>
                          <span className="shrink-0 font-bold">
                            {c.isFree ? 'Gratuit' : formatPrice(c.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. FORMULAIRE UNIQUE DES INFORMATIONS DE L'ÉTUDIANT */}
            <form 
              onSubmit={handleSubmitRegistration}
              className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                isDark ? 'bg-[#10131E] border-white/[0.08] shadow-black/40' : 'bg-white border-slate-200'
              }`}
            >
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    <span>Informations Personnelles de l'Étudiant</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Renseignez vos coordonnées pour la délivrance du certificat officiel.
                  </p>
                </div>
              </div>

              {/* État connexion Google */}
              {!currentUser ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div className="flex-1">
                    <span className="font-bold block">Connexion Google conseillée</span>
                    <span>Connectez-vous pour lier automatiquement cette formation à votre profil cloud.</span>
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal('Connectez-vous pour finaliser votre inscription.')}
                      className="mt-2 inline-block px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Se connecter avec Google
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compte étudiant connecté : <strong>{currentUser.email}</strong></span>
                </div>
              )}

              {/* Champ Nom & Prénom */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Nom & Prénom de l'apprenant <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Michella Nooro"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition shadow-2xs ${
                    isDark
                      ? 'bg-[#141724] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                      : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ce nom sera imprimé sur votre certificat de fin de formation.
                </span>
              </div>

              {/* Champ Email */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Adresse e-mail <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="votre.email@gmail.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition shadow-2xs ${
                    isDark
                      ? 'bg-[#141724] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                      : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* SECTION PAIEMENT MOBILE MONEY (si payant) */}
              {isPaidCourse ? (
                <div className={`pt-4 border-t space-y-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`block text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Paiement Mobile Money Madagascar
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Sélectionnez votre opérateur et entrez votre numéro
                      </span>
                    </div>
                    <span className="text-base font-black text-indigo-600">
                      {formatPrice(currentCourse.price)}
                    </span>
                  </div>

                  {/* 3 Opérateurs Mobile Money (MVola, Orange Money, Airtel Money) */}
                  <div className="grid grid-cols-3 gap-3">
                    {OPERATORS.map((op) => {
                      const isSelected = selectedOperator === op.id;
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => {
                            setSelectedOperator(op.id);
                            if (!studentPhone) setStudentPhone(op.defaultPrefix);
                          }}
                          className={`p-3.5 rounded-2xl text-left transition cursor-pointer relative ${
                            isDark
                              ? isSelected
                                ? 'bg-indigo-950/40 border-2 border-indigo-500 text-white ring-2 ring-indigo-500/20 shadow-xs'
                                : 'bg-[#141724] border border-white/10 text-slate-300 hover:border-white/20'
                              : isSelected
                                ? 'bg-white border-2 border-indigo-600 text-slate-900 ring-2 ring-indigo-500/20 shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: op.brandColor }} />
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <span className={`w-3.5 h-3.5 rounded-full border inline-block ${
                                isDark ? 'border-white/20' : 'border-slate-300'
                              }`} />
                            )}
                          </div>
                          <div className="font-extrabold text-xs tracking-tight">{op.name}</div>
                          <div className={`text-[10px] mt-0.5 ${
                            isSelected 
                              ? isDark ? 'text-indigo-300 font-medium' : 'text-indigo-600 font-medium'
                              : isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {op.helper}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Champ Téléphone */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Numéro Mobile Money ({currentOp.name}) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="034 12 345 67"
                        value={studentPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition shadow-2xs ${
                          isDark
                            ? 'bg-[#141724] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                            : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Une notification de validation sera envoyée sur ce numéro pour régler les {formatPrice(currentCourse.price)}.
                    </span>
                  </div>
                </div>
              ) : (
                /* Badge Cours Gratuit */
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Formation 100% Gratuite</span>
                    <span>Aucun paiement requis. Votre inscription est offerte par SkillHub Madagascar.</span>
                  </div>
                </div>
              )}

              {/* Si déjà inscrit */}
              {isAlreadyEnrolled && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Vous êtes déjà inscrit à cette formation !</span>
                    </span>
                    <button
                      type="button"
                      onClick={onGoToLearningSpace}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      Espace apprenant
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Vous souhaitez imprimer le nom <strong>« {studentName || 'personnalisé'} »</strong> sur votre certificat officiel ? Cliquez ci-dessous pour actualiser le certificat :
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || !studentName.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mettre à jour le nom sur le certificat ({studentName.trim()})</span>
                  </button>
                </div>
              )}

              {/* Message d'erreur s'il y a lieu */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* État de traitement */}
              {isSubmitting && processingStatus && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{processingStatus}</span>
                </div>
              )}

              {/* Bouton de confirmation de paiement et d'inscription */}
              {!isAlreadyEnrolled && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        {isPaidCourse 
                          ? `Valider & Payer ${formatPrice(currentCourse.price)}`
                          : "Valider mon inscription gratuite"
                        }
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Garanties */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Certificat officiel inclus</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
