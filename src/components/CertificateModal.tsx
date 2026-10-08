'use client';

import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, Sparkles, X, ShieldCheck, Edit2, Check } from 'lucide-react';
import { Enrollment } from '@/src/types';

interface CertificateModalProps {
  enrollment: Enrollment;
  userName: string;
  onClose: () => void;
  onUpdateStudentName?: (enrollmentId: string, newName: string) => Promise<void>;
}

export default function CertificateModal({ 
  enrollment, 
  userName, 
  onClose,
  onUpdateStudentName 
}: CertificateModalProps) {
  const getResolvedName = () => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('skillhub_preferred_student_name') : null;
    return enrollment.studentName || enrollment.userDisplayName || saved || userName || 'Apprenant Émérite';
  };

  const [currentName, setCurrentName] = useState(getResolvedName);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(getResolvedName);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronisation dynamique si l'inscription ou le nom change
  useEffect(() => {
    const name = getResolvedName();
    setCurrentName(name);
    setEditInput(name);
  }, [enrollment.id, enrollment.studentName, enrollment.userDisplayName, userName]);

  const certDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const courseTitle = enrollment.courseSnapshot?.title || 'Formation Professionnelle Certifiante';
  const instructor = enrollment.courseSnapshot?.instructorName || 'Équipe Pédagogique SkillHub';

  const handlePrint = () => {
    window.print();
  };

  const handleSaveName = async () => {
    if (!editInput.trim()) return;
    const clean = editInput.trim();
    setCurrentName(clean);
    setIsEditing(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('skillhub_preferred_student_name', clean);
    }

    if (onUpdateStudentName) {
      setIsSaving(true);
      try {
        await onUpdateStudentName(enrollment.id, clean);
      } catch (err) {
        console.warn('Erreur mise à jour nom certificat:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Barre d'action supérieure */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Certificat Officiel de Réussite
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger / Imprimer (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Le Diplôme / Certificat (Design Luxe & Prestigieux) */}
        <div className="p-8 sm:p-12 relative bg-gradient-to-br from-amber-50/40 via-white to-indigo-50/30 text-center font-serif border-8 border-double border-amber-600/30 m-4 rounded-2xl">
          {/* Sceau doré de certification */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 border-4 border-white">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" />
          </div>

          <div className="font-sans text-xs font-black uppercase tracking-widest text-indigo-900 mb-1">
            SkillHub Academy of Technology & Design
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            CERTIFICAT D'ACCOMPLISSEMENT
          </h1>

          <p className="text-xs text-slate-500 font-sans uppercase tracking-wider mb-5">
            Ce document officiel atteste que
          </p>

          {/* Nom du diplômé avec bouton de modification clairement visible */}
          {!isEditing ? (
            <div className="flex flex-col items-center justify-center gap-2 mb-6">
              <div className="inline-flex items-center justify-center gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 underline decoration-amber-400 decoration-3 underline-offset-8 font-sans">
                  {currentName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditInput(currentName);
                    setIsEditing(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  title="Modifier le nom affiché sur ce certificat officiel"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Modifier le nom</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Nom imprimé sur le diplôme officiel • Cliquez sur <strong>« Modifier le nom »</strong> pour le changer.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6 font-sans max-w-md mx-auto">
              <input
                type="text"
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                placeholder="Nom complet de l'apprenant"
                className="w-full sm:w-auto flex-1 px-4 py-2 border-2 border-indigo-500 rounded-xl text-indigo-950 font-bold text-center text-lg focus:outline-hidden shadow-xs bg-white"
                autoFocus
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSaving || !editInput.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-sans leading-relaxed mb-6">
            a suivi avec assiduité et validé à <span className="font-bold text-emerald-600">100%</span> l'ensemble des modules théoriques, projets pratiques et évaluations de la formation d'excellence :
          </p>

          <div className="bg-white/80 backdrop-blur-sm py-3 px-6 rounded-2xl border border-amber-200/80 max-w-md mx-auto shadow-2xs mb-8">
            <h3 className="font-sans font-bold text-base text-slate-900 leading-snug">
              {courseTitle}
            </h3>
            <span className="text-[11px] font-sans text-slate-500 block mt-1">
              Catégorie : {enrollment.courseSnapshot?.category} • Volume horaire validé
            </span>
          </div>

          {/* Signatures & Tampons */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 font-sans text-xs max-w-md mx-auto text-left">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Délivré le</span>
              <span className="font-semibold text-slate-700">{certDate}</span>
              <span className="text-[10px] text-emerald-600 font-medium block mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Vérifié sur Firestore
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Instructeur certifié</span>
              <span className="font-semibold text-slate-800">{instructor}</span>
              <span className="text-[10px] text-indigo-600 block mt-1 italic font-serif">Signature Officielle</span>
            </div>
          </div>
        </div>

        {/* Pied de dialogue */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold truncate mr-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Identifiant unique : {enrollment.id.slice(0, 16)}...</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition cursor-pointer shrink-0"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
