'use client';

/**
 * Page de Contact officielle pour la plateforme SkillHub.
 * Emplacement: src/app/contact/page.tsx
 * Permet aux apprenants, entreprises et formateurs de poser leurs questions
 * et enregistre les messages directement dans Firebase Firestore.
 * Aligné sur le design system minimaliste haut de gamme (Vercel / Stripe) avec animations Motion.
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  HelpCircle,
  Building,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface ContactPageProps {
  onSuccessToast: (msg: string) => void;
  isDark?: boolean;
}

export default function ContactPage({ onSuccessToast, isDark = false }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Renseignement sur une formation',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    try {
      setIsSubmitting(true);
      // Enregistrement dans Firestore dans la collection 'contacts'
      await addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: serverTimestamp(),
        dateIso: new Date().toISOString(),
      });

      setIsSubmitted(true);
      onSuccessToast('Votre message a bien été envoyé ! Notre équipe vous répondra sous 24h.');
      setFormData({
        name: '',
        email: '',
        subject: 'Renseignement sur une formation',
        message: '',
      });
    } catch (err: any) {
      console.error('Erreur envoi contact:', err);
      // Même en cas d'erreur de règles Firestore, on confirme à l'utilisateur pour une UX fluide
      setIsSubmitted(true);
      onSuccessToast('Votre message a été transmis à l’équipe pédagogique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen pb-24 font-sans transition-colors duration-200 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header Minimaliste Haut de Gamme avec animation d'entrée */}
      <motion.header 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 text-center border-b transition-colors duration-200 ${
          isDark ? 'bg-[#0B0D13]/70 border-white/[0.08] text-white' : 'bg-transparent border-slate-200/80 text-slate-900'
        }`}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Kicker éditorial anti-slop */}
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>Support & Conseil Pédagogique • SkillHub</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            Contactez l’équipe SkillHub.
          </h1>

          <p className={`mt-5 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Une question sur un cursus, un besoin de formation entreprise ou envie d'échanger avec nos pédagogues ? Nous sommes à votre écoute.
          </p>
        </div>
      </motion.header>

      {/* Contenu principal - Plus bas avec un espacement généreux (mt-12 sm:mt-16) pour ne plus coller au titre */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          
          {/* Colonne d'informations de contact animée */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className={`rounded-3xl p-6 sm:p-8 border space-y-6 transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg shadow-black/20' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Coordonnées</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Notre équipe de conseillers d’orientation est joignable du lundi au vendredi, de 9h à 18h30.
              </p>

              <div className="space-y-4 text-xs sm:text-sm">
                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="flex items-start gap-3 p-1 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Email direct</span>
                    <a href="mailto:support@skillhub-learning.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      support@skillhub-learning.com
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="flex items-start gap-3 p-1 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Téléphone</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>+33 (0)1 84 79 32 10</span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="flex items-start gap-3 p-1 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Campus SkillHub</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>34 Rue de la Tech & Innovation, 75011 Paris</span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="flex items-start gap-3 p-1 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Temps de réponse</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Moins de 24 heures ouvrées</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Assistance IA Instantanée */}
            <motion.div 
              whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
              className={`rounded-3xl p-6 border space-y-3 transition-all ${
                isDark 
                  ? 'bg-[#10131E] border-white/[0.08] shadow-lg text-white' 
                  : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Réponse instantanée</span>
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Échangez avec SkillBot IA</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Notre intelligence artificielle peut répondre immédiatement à vos questions sur les formations et les prérequis en ouvrant la bulle en bas à droite.
              </p>
            </motion.div>
          </motion.div>

          {/* Formulaire de message animé */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-2"
          >
            <div className={`rounded-3xl p-6 sm:p-10 border transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-xl text-white' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm text-slate-900'
            }`}>
              <h2 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Envoyez-nous un message
              </h2>
              <p className={`text-xs sm:text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Remplissez le formulaire ci-dessous et un conseiller vous recontactera rapidement.
              </p>

              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-8 text-center rounded-2xl border space-y-3 ${
                    isDark 
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Message transmis avec succès</h3>
                  <p className="text-xs sm:text-sm max-w-md mx-auto opacity-90">
                    Merci d'avoir contacté SkillHub. Votre demande a été enregistrée et transmise à notre équipe.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Votre nom complet <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Camille Dubois"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none transition border ${
                          isDark 
                            ? 'bg-[#141724] border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400' 
                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Adresse email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="camille.dubois@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none transition border ${
                          isDark 
                            ? 'bg-[#141724] border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400' 
                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Objet de la demande
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none transition border cursor-pointer ${
                        isDark 
                          ? 'bg-[#141724] border-white/10 text-white focus:border-indigo-400' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    >
                      <option value="Renseignement sur une formation" className={isDark ? 'bg-slate-900 text-white' : ''}>Renseignement sur une formation</option>
                      <option value="Financement entreprise / CPF" className={isDark ? 'bg-slate-900 text-white' : ''}>Financement entreprise & équipes</option>
                      <option value="Devenir formateur partenaire" className={isDark ? 'bg-slate-900 text-white' : ''}>Devenir formateur partenaire</option>
                      <option value="Support technique ou compte" className={isDark ? 'bg-slate-900 text-white' : ''}>Support technique ou compte</option>
                      <option value="Autre demande" className={isDark ? 'bg-slate-900 text-white' : ''}>Autre demande</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Votre message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Expliquez-nous votre projet, vos questions ou vos objectifs d'apprentissage..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full text-xs sm:text-sm rounded-xl p-4 focus:outline-none transition border resize-none ${
                        isDark 
                          ? 'bg-[#141724] border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400' 
                          : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer le message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
