'use client';

/**
 * Page Catalogue Public des Formations SkillHub.
 * Emplacement: src/app/catalog/page.tsx
 * - Support Dark Mode / Light Mode
 * - Filtres dynamiques en temps réel sous forme de barre de boutons interactifs avec icônes et compteurs
 * - Transition fluide au clic
 * - Utilisation du composant CourseCard.tsx avec fallback d'images et animations 'Wahou' au survol
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  X, 
  Code2, 
  Cpu, 
  Palette, 
  Server, 
  Layers, 
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Course, CourseCategory, CourseLevel } from '@/src/types';
import { COURSES_DATA } from '@/src/lib/coursesData';
import CourseCard from '@/src/components/CourseCard';

export const MOCK_COURSES = COURSES_DATA;

const CATEGORY_TABS: { label: string; value: CourseCategory | 'all'; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Tout', value: 'all', icon: Layers },
  { label: 'Développement Web', value: 'development', icon: Code2 },
  { label: 'IA & Data', value: 'ai-data', icon: Cpu },
  { label: 'Design UI/UX', value: 'design', icon: Palette },
  { label: 'DevOps & Cloud', value: 'devops', icon: Server },
];

const LEVELS: { label: string; value: CourseLevel | 'all' }[] = [
  { label: 'Tous les niveaux', value: 'all' },
  { label: 'Débutant', value: 'beginner' },
  { label: 'Intermédiaire', value: 'intermediate' },
  { label: 'Avancé', value: 'advanced' },
];

interface CatalogPageProps {
  courses?: Course[];
  onSelectCourse?: (courseId: string) => void;
  onGoToRegistration?: (courseId?: string) => void;
  enrolledCourseIds?: string[];
  favoriteCourseIds?: string[];
  onToggleFavorite?: (course: Course) => void;
  isDark?: boolean;
}

export default function CatalogPage({
  courses,
  onSelectCourse,
  onGoToRegistration,
  enrolledCourseIds = [],
  favoriteCourseIds = [],
  onToggleFavorite,
  isDark = false,
}: CatalogPageProps) {
  const currentCatalog = courses && courses.length > 0 ? courses : COURSES_DATA;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc'>('popular');

  // Filtrage et tri réactifs
  const filteredCourses = useMemo(() => {
    return currentCatalog.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.tags && course.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false;
      }

      if (selectedLevel !== 'all' && course.level !== selectedLevel && course.level !== 'all-levels') {
        return false;
      }

      if (priceFilter === 'free' && !course.isFree && course.price > 0) return false;
      if (priceFilter === 'paid' && (course.isFree || course.price === 0)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.reviewsCount - a.reviewsCount;
    });
  }, [currentCatalog, searchTerm, selectedCategory, selectedLevel, priceFilter, sortBy]);

  // Nombre de cours par catégorie pour les badges des boutons
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: currentCatalog.length };
    currentCatalog.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [currentCatalog]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setPriceFilter('all');
    setSortBy('popular');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedLevel !== 'all' ||
    priceFilter !== 'all' ||
    sortBy !== 'popular';

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-200 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* En-tête architectural de la page catalogue */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative pt-16 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b transition-colors duration-200 ${
          isDark 
            ? 'bg-[#0B0D13]/70 border-white/[0.08] text-white' 
            : 'bg-transparent border-slate-200/80 text-slate-900'
        }`}
      >
        {/* Grille interne zénithale avec micro-accentuation */}
        <div className={`absolute inset-0 mask-radial-fade pointer-events-none ${
          isDark ? 'bg-grid-architect-dark opacity-100' : 'bg-transparent opacity-0'
        }`} />

        {/* Lignes fines horizontales de repère d'ingénierie */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left">
          {/* Kicker éditorial anti-slop */}
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>Catalogue Officiel • Formations Certifiantes</span>
          </div>

          <h1 
            id="catalog-hero-title"
            className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.1] scroll-mt-28 ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Développez vos compétences avec nos formations d’élite.
          </h1>

          <p className={`mt-4 text-base sm:text-lg max-w-2xl font-normal leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Des programmes exigeants et certifiants conçus pour maîtriser le développement web moderne, l’intelligence artificielle appliquée et l'ingénierie logicielle.
          </p>

          {/* Barre de recherche senior */}
          <div className="mt-8 max-w-2xl">
            <div className={`relative flex items-center rounded-2xl overflow-hidden p-1.5 transition-all duration-200 ${
              isDark 
                ? 'bg-[#121520] border border-white/[0.12] focus-within:border-white/[0.3] text-white shadow-xl shadow-black/30' 
                : 'bg-white border border-slate-300 focus-within:border-slate-500 text-slate-900 shadow-md shadow-slate-200/50'
            }`}>
              <Search className={`w-5 h-5 ml-3 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Rechercher par technologie (React, Python, IA, Docker) ou formateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2.5 text-sm sm:text-base focus:outline-hidden bg-transparent placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1.5 mr-1 text-slate-400 hover:text-slate-200 rounded-lg transition cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shrink-0 transition shadow-2xs">
                Filtrer
              </div>
            </div>
          </div>

          {/* Raccourci vers la Page d'Inscription des Étudiants */}
          {onGoToRegistration && (
            <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Vous préférez vous inscrire directement ?
              </span>
              <button
                onClick={() => onGoToRegistration()}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/[0.1]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <span>Accéder au formulaire officiel d'inscription →</span>
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Contenu principal et barre de filtres - Abaissé avec mt-10 sm:mt-14 pour aérer la barre de domaine d'apprentissage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 relative z-20">
        {/* Panneau de filtres interactifs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className={`rounded-3xl p-5 sm:p-7 border mb-10 space-y-6 transition-colors duration-200 ${
            isDark 
              ? 'bg-[#10131D] border-white/[0.08] shadow-2xl shadow-black/50 text-slate-100' 
              : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/40 text-slate-900'
          }`}
        >
          
          {/* BARRE DE BOUTONS INTERACTIFS DE CATÉGORIES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Domaine d'apprentissage
              </span>
              <span className={`text-xs font-mono font-medium ${
                isDark ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} disponible{filteredCourses.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {CATEGORY_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = selectedCategory === tab.value;
                const count = categoryCounts[tab.value] ?? 0;

                return (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    key={tab.value}
                    onClick={() => setSelectedCategory(tab.value)}
                    className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-white text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-950 text-white font-bold shadow-xs'
                        : isDark
                          ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.06]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 transition-transform group-hover:scale-105 ${isSelected ? (isDark ? 'text-slate-950' : 'text-white') : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-md font-mono ${
                        isSelected
                          ? isDark ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 text-white'
                          : isDark
                          ? 'bg-white/10 text-slate-400'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Filtres secondaires */}
          <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex flex-wrap items-center gap-3">
              {/* Niveau */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Niveau :</span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as any)}
                  className={`text-xs border rounded-xl px-3 py-1.5 font-medium focus:outline-none cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'
                  }`}
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value} className={isDark ? 'bg-slate-900 text-white' : ''}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarif */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tarif :</span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className={`text-xs border rounded-xl px-3 py-1.5 font-medium focus:outline-none cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'
                  }`}
                >
                  <option value="all" className={isDark ? 'bg-slate-900 text-white' : ''}>Tous les prix</option>
                  <option value="free" className={isDark ? 'bg-slate-900 text-white' : ''}>Gratuits uniquement</option>
                  <option value="paid" className={isDark ? 'bg-slate-900 text-white' : ''}>Formations payantes</option>
                </select>
              </div>

              {/* Tri */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Trier :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`text-xs border rounded-xl px-3 py-1.5 font-medium focus:outline-none cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'
                  }`}
                >
                  <option value="popular" className={isDark ? 'bg-slate-900 text-white' : ''}>Popularité</option>
                  <option value="rating" className={isDark ? 'bg-slate-900 text-white' : ''}>Mieux notés ⭐</option>
                  <option value="price-asc" className={isDark ? 'bg-slate-900 text-white' : ''}>Prix croissant</option>
                  <option value="price-desc" className={isDark ? 'bg-slate-900 text-white' : ''}>Prix décroissant</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1.5 hover:underline px-2.5 py-1 rounded-lg transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Réinitialiser les filtres</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Grille de cartes de cours */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-300">
            {filteredCourses.map((course, idx) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const isFavorite = favoriteCourseIds.includes(course.id);

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <CourseCard
                    course={course}
                    isEnrolled={isEnrolled}
                    isFavorite={isFavorite}
                    onSelectCourse={onSelectCourse}
                    onEnrollClick={onGoToRegistration}
                    onToggleFavorite={onToggleFavorite}
                    isDark={isDark}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* État aucun résultat */
          <div className={`rounded-3xl p-14 text-center border max-w-lg mx-auto my-12 shadow-sm animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Aucune formation trouvée</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Nous n'avons trouvé aucun cours correspondant à vos critères dans cette catégorie.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition"
            >
              Voir toutes les formations
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
