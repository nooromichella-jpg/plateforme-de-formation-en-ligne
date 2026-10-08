'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  AlertCircle,
  BookOpen,
  PlayCircle,
  FileCheck,
  CreditCard,
  Lock
} from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatAriaryAmount } from '@/src/lib/currency';
import { User } from 'firebase/auth';

interface EnrollmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  currentUser: User | any | null;
  onConfirmEnrollment: (course: Course) => Promise<void>;
  onGoToLearningSpace?: () => void;
  onStartLearning?: (courseId: string) => void;
}

type Operator = 'mvola' | 'orange' | 'airtel';

interface OperatorInfo {
  id: Operator;
  name: string;
  badge: string;
  brandColor: string;
  bgLight: string;
  borderActive: string;
  prefixHelper: string;
  defaultPrefix: string;
}

const OPERATORS: OperatorInfo[] = [
  {
    id: 'mvola',
    name: 'MVola (Telma)',
    badge: 'N°1 à Madagascar',
    brandColor: '#F59E0B',
    bgLight: 'bg-amber-500/10',
    borderActive: 'border-amber-500 text-amber-900 bg-amber-50',
    prefixHelper: 'Exemple: 034 XX XXX XX ou 038 XX XXX XX',
    defaultPrefix: '034',
  },
  {
    id: 'orange',
    name: 'Orange Money',
    badge: 'Rapide & Fiable',
    brandColor: '#F97316',
    bgLight: 'bg-orange-500/10',
    borderActive: 'border-orange-500 text-orange-900 bg-orange-50',
    prefixHelper: 'Exemple: 032 XX XXX XX',
    defaultPrefix: '032',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    badge: 'Partout à Mada',
    brandColor: '#EF4444',
    bgLight: 'bg-red-500/10',
    borderActive: 'border-red-500 text-red-900 bg-red-50',
    prefixHelper: 'Exemple: 033 XX XXX XX',
    defaultPrefix: '033',
  },
];

export default function EnrollmentPaymentModal({
  isOpen,
  onClose,
  course,
  currentUser,
  onConfirmEnrollment,
  onGoToLearningSpace,
  onStartLearning,
}: EnrollmentPaymentModalProps) {
  const [selectedOperator, setSelectedOperator] = useState<Operator>('mvola');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');

  if (!isOpen) return null;

  const currentOp = OPERATORS.find((o) => o.id === selectedOperator) || OPERATORS[0];

  const handlePhoneChange = (val: string) => {
    // Nettoyer les caractères non numériques
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setErrorMessage(null);

    // Auto-détecter l'opérateur selon le préfixe
    if (cleaned.startsWith('034') || cleaned.startsWith('038')) {
      setSelectedOperator('mvola');
    } else if (cleaned.startsWith('032')) {
      setSelectedOperator('orange');
    } else if (cleaned.startsWith('033')) {
      setSelectedOperator('airtel');
    }
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Veuillez entrer un numéro Mobile Money valide (ex: 034 12 345 67).');
      return;
    }

    setErrorMessage(null);
    setStep('processing');

    const randomRef = `SKH-${selectedOperator.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionRef(randomRef);

    try {
      // Étape 1 : Simulation de la notification push USSD vers le téléphone
      setProcessingStatus(`Connexion au réseau ${currentOp.name}...`);
      await new Promise((res) => setTimeout(res, 800));

      setProcessingStatus(`Demande de débit de ${formatPrice(course.price)} envoyée au ${phoneNumber}...`);
      await new Promise((res) => setTimeout(res, 1200));

      setProcessingStatus(`Validation du code secret et débit sécurisé en cours...`);
      await new Promise((res) => setTimeout(res, 1000));

      // Étape 2 : Confirmation de l'inscription dans Firestore via onConfirmEnrollment
      setProcessingStatus('Enregistrement de la formation dans votre espace étudiant Firestore...');
      await onConfirmEnrollment(course);

      setStep('success');
    } catch (err: any) {
      console.error('Erreur lors du paiement Mobile Money:', err);
      setStep('input');
      setErrorMessage(err.message || 'Une erreur est survenue lors de la validation du paiement.');
    }
  };

  const handleClose = () => {
    setStep('input');
    setPhoneNumber('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* En-tête de la modale */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                Paiement Mobile Money Madagascar
              </h2>
              <p className="text-[11px] text-slate-300">
                MVola • Orange Money • Airtel Money
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 'input' && (
            <form onSubmit={handleInitiatePayment} className="space-y-5">
              {/* Récapitulatif du cours commandé */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-1">
                    {course.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formateur : {course.instructor.name} • {Math.round(course.durationMinutes / 60)}h de cours
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-indigo-700">
                    {formatPrice(course.price)}
                  </div>
                  {course.originalPrice && (
                    <div className="text-[11px] text-slate-400 line-through">
                      {formatAriaryAmount(course.originalPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Sélection de l'opérateur Mobile Money */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choisissez votre opérateur de paiement
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {OPERATORS.map((op) => {
                    const isSelected = selectedOperator === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => {
                          setSelectedOperator(op.id);
                          if (!phoneNumber) {
                            setPhoneNumber(op.defaultPrefix);
                          }
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition relative cursor-pointer ${
                          isSelected
                            ? `${op.borderActive} shadow-xs scale-102`
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: op.brandColor }} />
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <div className="font-extrabold text-xs leading-snug">
                          {op.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {op.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Numéro de téléphone Mobile Money */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Numéro Mobile Money du payeur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="034 12 345 67"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>ℹ️</span>
                  <span>{currentOp.prefixHelper}</span>
                </p>
              </div>

              {/* Message d'erreur s'il y en a */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Note de sécurité */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Paiement 100% sécurisé et simulé instantanément pour SkillHub Madagascar. Votre inscription sera automatiquement validée et synchronisée avec Firestore dès validation.
                </p>
              </div>

              {/* Bouton de confirmation de paiement */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Payer {formatPrice(course.price)} par {currentOp.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto flex items-center justify-center text-indigo-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Traitement de votre paiement Mobile Money
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto min-h-[40px] flex items-center justify-center font-medium">
                {processingStatus}
              </p>
              <div className="text-[11px] text-slate-400 bg-slate-100 rounded-xl py-2 px-3 inline-block">
                Référence transaction : <span className="font-mono font-bold text-slate-700">{transactionRef}</span>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Félicitations, vous êtes inscrit ! 🎉
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Votre paiement de <strong>{formatPrice(course.price)}</strong> via <strong>{currentOp.name}</strong> a été validé avec succès.
                </p>
              </div>

              {/* Reçu détaillé */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                  <span>Référence :</span>
                  <span className="font-mono font-bold text-slate-800">{transactionRef}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Formation :</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{course.title}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Montant réglé :</span>
                  <span className="font-bold text-emerald-600">{formatPrice(course.price)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Opérateur :</span>
                  <span className="font-semibold text-slate-800">{currentOp.name} ({phoneNumber})</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Compte étudiant :</span>
                  <span className="font-semibold text-slate-800">{currentUser?.email || 'Compte Google'}</span>
                </div>
              </div>

              {/* Les 2 boutons d'action demandés : aller à l'espace étudiant ou commencer le cours */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onGoToLearningSpace) {
                      onGoToLearningSpace();
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Accéder à mon espace d'apprentissage</span>
                </button>

                {onStartLearning && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onStartLearning(course.id);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                    <span>Commencer la formation maintenant</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
