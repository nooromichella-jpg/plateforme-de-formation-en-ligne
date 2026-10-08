'use client';

/**
 * Page "À propos" de la plateforme SkillHub.
 * Emplacement: src/app/about/page.tsx
 * Présente la vision, les valeurs, les formateurs et les statistiques de la plateforme.
 * Aligné sur le design system minimaliste haut de gamme (Vercel / Stripe) avec animations Motion.
 */

import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Users, 
  Award, 
  ShieldCheck, 
  Target, 
  Globe, 
  Rocket,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface AboutPageProps {
  onNavigateCatalog: () => void;
  isDark?: boolean;
}

export default function AboutPage({ onNavigateCatalog, isDark = false }: AboutPageProps) {
  return (
    <div className={`min-h-screen pb-24 font-sans transition-colors duration-200 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header Minimaliste Haut de Gamme avec animation */}
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
            <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>Notre Mission Pédagogique • SkillHub</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            Accélérer les carrières tech grâce à l’excellence et l’IA.
          </h1>

          <p className={`mt-5 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            SkillHub réunit les meilleurs ingénieurs, designers et chercheurs pour concevoir des formations concrètes, certifiantes et résolument tournées vers l'avenir.
          </p>
        </div>
      </motion.header>

      {/* Chiffres clés (Cartes au design ultra-pro, positionnées avec respiration naturelle mt-10 sm:mt-14) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg shadow-black/20' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-black mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>50 000+</div>
            <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Apprenants formés</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg shadow-black/20' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-black mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>98%</div>
            <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Taux de satisfaction</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg shadow-black/20' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-black mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>4.9 / 5</div>
            <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Note moyenne des cours</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.34 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg shadow-black/20' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-black mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>100%</div>
            <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Projets concrets</div>
          </motion.div>
        </div>
      </div>

      {/* Piliers pédagogiques */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Pourquoi apprendre avec SkillHub ?
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Nous combinons la rigueur de formations animées par des professionnels en poste avec un accompagnement personnalisé propulsé par l'IA.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`rounded-3xl p-8 border space-y-4 transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Apprentissage par la pratique
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Pas de théorie abstraite inutile. Chaque module aboutit à la réalisation d'un projet complet déployé sur le Cloud ou d'une interface réelle.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`rounded-3xl p-8 border space-y-4 transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Tuteur IA disponible 24/7
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              SkillBot, propulsé par les modèles Gemini de Google, analyse vos questions, vous débloque sur les exercices et personnalise votre rythme d'apprentissage.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`rounded-3xl p-8 border space-y-4 transition-all ${
              isDark 
                ? 'bg-[#10131E] border-white/[0.08] shadow-lg' 
                : 'bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Certifications valorisées
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              À l'issue de chaque cursus, recevez une attestation officielle vérifiable à intégrer sur LinkedIn ou votre CV auprès des recruteurs tech.
            </p>
          </motion.div>
        </div>

        {/* Bannière CTA claire et épurée (Fond clair en mode Light au lieu du bloc noir) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.008, transition: { duration: 0.2 } }}
          className={`rounded-3xl p-8 sm:p-12 border text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 transition-all relative overflow-hidden ${
            isDark
              ? 'bg-[#10131E] border-white/[0.1] shadow-2xl text-white'
              : 'bg-white/95 border-slate-200/90 shadow-xl shadow-slate-200/50 text-slate-900'
          }`}
        >
          {/* Accent lumineux d'ambiance en arrière-plan */}
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
              <Sparkles className="w-3 h-3" />
              Rejoignez l'élite tech
            </div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Prêt à transformer vos compétences ?
            </h3>
            <p className={`text-sm max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Rejoignez dès aujourd'hui notre communauté d'apprenants et démarrez votre prochaine formation avec accès immédiat.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateCatalog}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition shadow-md shadow-indigo-600/20 shrink-0 text-sm flex items-center gap-2 cursor-pointer relative z-10"
          >
            <span>Explorer le catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
