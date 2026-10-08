'use client';

/**
 * Composant Carte de Formation SkillHub (CourseCard.tsx).
 * - Alignement parfait avec le design épuré de la vue des favoris
 * - Image 100% nette, lumineuse et visible, sans filtre ni overlay sombre masquant
 * - Conteneur avec padding élégant (p-5), image arrondie (rounded-2xl)
 * - Gestion infaillible du fallback d'image avec Unsplash haute définition
 * - Bouton favoris identique avec animation fluide
 * - Support complet Dark / Light mode
 */

import React, { useState } from 'react';
import { 
  Clock, 
  BookOpen, 
  Star, 
  Heart, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  UserPlus 
} from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatAriaryAmount } from '@/src/lib/currency';

export const DEFAULT_FALLBACK_THUMBNAIL = 
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'development': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
  'ai-data': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'design': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
  'devops': 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
  'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'marketing': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
};

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  isFavorite?: boolean;
  onSelectCourse?: (courseId: string) => void;
  onEnrollClick?: (courseId: string) => void;
  onToggleFavorite?: (course: Course) => void;
  isDark?: boolean;
}

export default function CourseCard({
  course,
  isEnrolled = false,
  isFavorite = false,
  onSelectCourse,
  onEnrollClick,
  onToggleFavorite,
  isDark = false,
}: CourseCardProps) {
  const initialThumb = course.thumbnail && course.thumbnail.trim() !== ''
    ? course.thumbnail
    : (CATEGORY_DEFAULT_IMAGES[course.category] || DEFAULT_FALLBACK_THUMBNAIL);

  const [imgSrc, setImgSrc] = useState<string>(initialThumb);

  const handleImageError = () => {
    const fallback = CATEGORY_DEFAULT_IMAGES[course.category] || DEFAULT_FALLBACK_THUMBNAIL;
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setImgSrc(DEFAULT_FALLBACK_THUMBNAIL);
    }
  };

  return (
    <article
      onClick={() => onSelectCourse && onSelectCourse(course.id)}
      className={`group relative flex flex-col justify-between rounded-3xl border overflow-hidden p-5 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 ${
        isDark
          ? 'bg-[#10131E] border-white/[0.07] shadow-lg shadow-black/30 hover:border-white/[0.18] hover:bg-[#131724]'
          : 'bg-white border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300'
      }`}
    >
      <div>
        {/* Conteneur Image clair et net, aligné sur la vue Favoris (rounded-2xl, pas d'overlay sombre masquant) */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
          <img
            src={imgSrc}
            alt={course.title}
            onError={handleImageError}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge Bestseller / Nouveau si disponible */}
          {course.badge && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 ${
                  course.badge === 'bestseller'
                    ? 'bg-amber-500 text-white'
                    : course.badge === 'nouveau'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {course.badge}
              </span>
            </div>
          )}

          {/* Bouton Favoris (identique à la vue favoris) */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(course);
              }}
              className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
                isFavorite
                  ? 'bg-white text-rose-500 scale-100'
                  : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:scale-110'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          {/* Niveau de difficulté discret */}
          <span className="absolute bottom-2.5 right-2.5 text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg shadow-xs z-10">
            {course.level === 'beginner'
              ? 'Débutant'
              : course.level === 'intermediate'
              ? 'Intermédiaire'
              : course.level === 'advanced'
              ? 'Avancé'
              : 'Tous niveaux'}
          </span>
        </div>

        {/* Titre de la formation */}
        <h3 className={`font-bold text-base line-clamp-2 mb-1 transition-colors leading-snug ${
          isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
        }`}>
          {course.title}
        </h3>

        {/* Nom du formateur */}
        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
          <span>Par {course.instructor.name}</span>
          {course.instructor.title && (
            <>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{course.instructor.title}</span>
            </>
          )}
        </p>

        {/* Tags de catégories */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Détails complémentaires : Durée, leçons et avis */}
        <div className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl mb-3 ${
          isDark ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{Math.round(course.durationMinutes / 60)}h</span>
            <span className="text-slate-400">•</span>
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>{course.lessonsCount} leçons</span>
          </div>

          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className={isDark ? 'text-white' : 'text-slate-900'}>{course.rating}</span>
            <span className="text-[11px] text-slate-400 font-normal">({course.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Pied de carte : Prix et bouton d'action aligné sur les Favoris */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-2 flex items-center justify-between gap-3">
        <div>
          {course.isFree || course.price === 0 ? (
            <span className="text-base font-extrabold text-emerald-500">Gratuit</span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              {course.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatAriaryAmount(course.originalPrice)}
                </span>
              )}
              <span className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatPrice(course.price)}
              </span>
            </div>
          )}
        </div>

        {isEnrolled ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCourse && onSelectCourse(course.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              isDark
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Inscrit</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCourse && onSelectCourse(course.id);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Voir le programme complet"
            >
              <span>Détails</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEnrollClick) {
                  onEnrollClick(course.id);
                } else if (onSelectCourse) {
                  onSelectCourse(course.id);
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              title="S'inscrire directement à cette formation"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>S'inscrire</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
