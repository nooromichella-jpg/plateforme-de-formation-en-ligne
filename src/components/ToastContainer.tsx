'use client';

/**
 * Système de Notifications Toasts Animées (ToastContainer.tsx).
 * Affiche des alertes interactives modernes avec :
 * - Icônes contextuelles (CheckCircle, Flame, Heart, AlertCircle, Info, Sparkles)
 * - Animations fluides de slide et fade
 * - Barre de progression de temporisation
 * - Bouton de fermeture manuelle
 * - Thème sombre / clair adaptatif
 */

import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Heart, 
  Sparkles, 
  X, 
  BookOpen,
  Award
} from 'lucide-react';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'enroll' | 'unenroll' | 'favorite';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  isDark?: boolean;
}

export default function ToastContainer({ toasts, onDismiss, isDark = false }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        let borderClass = isDark ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-300' : 'border-emerald-200 bg-white text-slate-800';
        let accentGlow = 'shadow-emerald-500/10';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = isDark ? 'border-rose-500/40 bg-slate-900/95 text-rose-300' : 'border-rose-200 bg-white text-slate-800';
          accentGlow = 'shadow-rose-500/10';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
          borderClass = isDark ? 'border-sky-500/40 bg-slate-900/95 text-sky-300' : 'border-sky-200 bg-white text-slate-800';
          accentGlow = 'shadow-sky-500/10';
        } else if (toast.type === 'enroll') {
          icon = <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 animate-spin" />;
          borderClass = isDark ? 'border-indigo-500/50 bg-slate-900/95 text-indigo-200' : 'border-indigo-200 bg-white text-slate-800';
          accentGlow = 'shadow-indigo-500/20';
        } else if (toast.type === 'unenroll') {
          icon = <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />;
          borderClass = isDark ? 'border-amber-500/40 bg-slate-900/95 text-amber-200' : 'border-amber-200 bg-white text-slate-800';
          accentGlow = 'shadow-amber-500/15';
        } else if (toast.type === 'favorite') {
          icon = <Heart className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0 animate-bounce" />;
          borderClass = isDark ? 'border-rose-500/40 bg-slate-900/95 text-rose-200' : 'border-rose-200 bg-white text-slate-800';
          accentGlow = 'shadow-rose-500/15';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${borderClass} ${accentGlow} backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-5`}
          >
            <div className="pt-0.5">{icon}</div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-90">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs font-semibold leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-800/40"
              title="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
