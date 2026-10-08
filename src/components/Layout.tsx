import React from 'react';
import { 
  GraduationCap, 
  Heart, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut,
  BookOpen,
  UserPlus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Enrollment } from '@/src/types';
import ToastContainer, { ToastItem } from './ToastContainer';
import CertificateModal from './CertificateModal';
import AuthModal from './AuthModal';
import AIChatbot from './AIChatbot';

export interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onNavigate?: (tab: 'catalog' | 'register' | 'enrollments' | 'favorites' | 'about' | 'contact' | 'admin' | string) => void;
  currentUser?: User | null;
  authLoading?: boolean;
  onOpenAuthModal?: (reason?: string) => void;
  onSignOut?: () => void;
  enrollmentsCount?: number;
  favoritesCount?: number;
  isDark?: boolean;
  onToggleTheme?: () => void;
  toasts?: ToastItem[];
  onDismissToast?: (id: string) => void;
  selectedCertificateEnrollment?: Enrollment | null;
  onCloseCertificateModal?: () => void;
  onUpdateStudentName?: (enrollmentId: string, newName: string) => Promise<void>;
  isAuthModalOpen?: boolean;
  onCloseAuthModal?: () => void;
  isPopupBlocked?: boolean;
  authModalReason?: string;
  onAuthSuccess?: (user: User, message?: string) => void;
  hideNavbar?: boolean;
  hideFooter?: boolean;
  hideChatbot?: boolean;
}

/**
 * Composant de Layout Principal de SkillHub.
 * Emplacement: src/components/Layout.tsx
 * 
 * Centralise :
 * - Le conteneur racine avec gestion des thèmes Sombre / Clair
 * - La barre de navigation principale (Navbar) avec logo, onglets, compteurs, thème et authentification
 * - Les modales globales (Toasts, Authentification, Certificat)
 * - Le pied de page (Footer)
 * - Le widget d'assistance IA flottant (SkillBot)
 */
export default function Layout({
  children,
  activeTab = 'catalog',
  onNavigate,
  currentUser = null,
  authLoading = false,
  onOpenAuthModal,
  onSignOut,
  enrollmentsCount = 0,
  favoritesCount = 0,
  isDark = true,
  onToggleTheme,
  toasts = [],
  onDismissToast,
  selectedCertificateEnrollment = null,
  onCloseCertificateModal,
  onUpdateStudentName,
  isAuthModalOpen = false,
  onCloseAuthModal,
  isPopupBlocked = false,
  authModalReason,
  onAuthSuccess,
  hideNavbar = false,
  hideFooter = false,
  hideChatbot = false,
}: LayoutProps) {
  const scrollToCatalogHero = () => {
    if (typeof window !== 'undefined') {
      const heroTitle = document.getElementById('catalog-hero-title');
      if (heroTitle) {
        heroTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (tab: string) => {
    if (tab === 'catalog') {
      scrollToCatalogHero();
    }
    if (onNavigate) {
      onNavigate(tab);
    }
    if (tab === 'catalog') {
      setTimeout(scrollToCatalogHero, 60);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToCatalogHero();
    if (onNavigate) {
      onNavigate('catalog');
    }
    setTimeout(scrollToCatalogHero, 60);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white relative ${
      isDark ? 'bg-[#090A0F] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* =========================================================================
          Fond Architectural Minimaliste (Inspiré des Design Systems Vercel & Stripe)
          - Fond blanc cassé doux (bg-slate-50)
          - Grille géométrique ultra-fine en pure Tailwind linear-gradient
          - Masque radial progressif naturel
          - Halo lumineux zénithal doux et élégant sans néons saturés
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Grille géométrique ultra-fine Vercel / Stripe style */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            isDark 
              ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000_30%,transparent_90%)]' 
              : 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000_40%,transparent_100%)] opacity-70'
          }`} 
        />

        {/* Effet lumineux zénithal très subtil pour donner de la profondeur sans néon criard */}
        <div 
          className={`absolute -top-40 left-1/2 -translate-x-1/2 rounded-full pointer-events-none ${
            isDark 
              ? 'w-[900px] h-[360px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]' 
              : 'w-[900px] h-[480px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(241,245,249,0.6)_40%,transparent_75%)] blur-2xl opacity-90'
          }`}
        />

        {/* Ligne de crête zénithale d'ingénierie (hairline border) */}
        <div 
          className="absolute top-0 inset-x-0 h-px transition-colors duration-200"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 70%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(203, 213, 225, 0.6) 20%, rgba(148, 163, 184, 0.8) 50%, rgba(203, 213, 225, 0.6) 80%, transparent 100%)'
          }}
        />

        {/* Lignes fines verticales de structure architecturale (alignées avec les marges 7xl) */}
        <div 
          className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 border-x border-dashed transition-colors duration-200"
          style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(148, 163, 184, 0.15)' }}
        />
      </div>

      {/* Système de Toasts Flottants Animés */}
      {toasts && toasts.length > 0 && onDismissToast && (
        <ToastContainer toasts={toasts} onDismiss={onDismissToast} isDark={isDark} />
      )}

      {/* Modal Certificat Officiel */}
      {selectedCertificateEnrollment && onCloseCertificateModal && (
        <CertificateModal
          enrollment={selectedCertificateEnrollment}
          userName={
            selectedCertificateEnrollment.studentName ||
            selectedCertificateEnrollment.userDisplayName ||
            currentUser?.displayName ||
            currentUser?.email ||
            'Apprenant SkillHub'
          }
          onClose={onCloseCertificateModal}
          onUpdateStudentName={onUpdateStudentName}
        />
      )}

      {/* Modal d'Authentification Sécurisée (Google, Email, Démo 1-Clic) */}
      {isAuthModalOpen && onCloseAuthModal && onAuthSuccess && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={onCloseAuthModal}
          initialPopupBlocked={isPopupBlocked}
          reason={authModalReason}
          isDark={isDark}
          onSuccess={onAuthSuccess}
        />
      )}

      {/* Barre de navigation principale SkillHub */}
      {!hideNavbar && (
        <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 relative ${
          isDark ? 'bg-[#090A0F]/85 border-white/[0.07]' : 'bg-[#F8F9FB]/85 border-slate-200/80 shadow-2xs'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div 
                className="flex items-center gap-3 cursor-pointer group select-none" 
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLogoClick(e as any);
                  }
                }}
                title="SkillHub - Retour en haut du catalogue"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-800 dark:border-white/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Skill<span className="text-indigo-500 font-normal">Hub</span>
                  </span>
                  {/* <span className={`hidden sm:inline-block ml-2 text-[11px] font-mono tracking-wider uppercase ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    / 2026
                  </span> */}
                </div>
              </div>

              {/* Onglets de navigation */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handleNavClick('catalog')}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === 'catalog'
                      ? isDark ? 'bg-white/10 text-white font-bold' : 'bg-slate-200/80 text-slate-900 font-bold'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Catalogue
                </button>

                <button
                  onClick={() => handleNavClick('register')}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'register'
                      ? isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Page d'inscription des étudiants (/register)"
                >
                  <UserPlus className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Inscription</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser && onOpenAuthModal) {
                      onOpenAuthModal('Connectez-vous pour accéder à votre espace d\'apprentissage et vos certificats.');
                    } else {
                      handleNavClick('enrollments');
                    }
                  }}
                  className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'enrollments'
                      ? isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Mon espace d'apprentissage (/my-courses)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Mon espace d'apprentissage</span>
                  {currentUser && enrollmentsCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                      {enrollmentsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!currentUser && onOpenAuthModal) {
                      onOpenAuthModal('Connectez-vous pour retrouver votre liste de cours favoris.');
                    } else {
                      handleNavClick('favorites');
                    }
                  }}
                  className={`hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === 'favorites'
                      ? isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Favoris</span>
                  {currentUser && favoritesCount > 0 && (
                    <span className="ml-1 text-[11px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('about')}
                  className={`hidden md:block px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === 'about'
                      ? isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  À propos
                </button>

                <button
                  onClick={() => handleNavClick('contact')}
                  className={`hidden md:block px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === 'contact'
                      ? isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Contact
                </button>

                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === 'admin'
                      ? isDark ? 'bg-indigo-950 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/30'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Accéder au Back-Office Administrateur"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Actions : Bascule Mode Sombre / Clair + Profil Google */}
              <div className="flex items-center gap-2">
                {/* Bouton Toggle Dark / Light Mode */}
                {onToggleTheme && (
                  <button
                    onClick={onToggleTheme}
                    aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      isDark
                        ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 hover:rotate-12'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 hover:-rotate-12'
                    }`}
                    title={isDark ? 'Mode clair' : 'Mode sombre'}
                  >
                    {isDark ? <Sun className="w-4 h-4 fill-amber-400/20" /> : <Moon className="w-4 h-4" />}
                  </button>
                )}

                {/* Authentification avec Firebase Auth */}
                {authLoading ? (
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                ) : currentUser ? (
                  <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'Utilisateur'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-indigo-400 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="hidden lg:block text-left text-xs">
                      <div className={`font-semibold truncate max-w-[120px] ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {currentUser.displayName || 'Apprenant'}
                      </div>
                      <div className="text-[10px] text-emerald-500 font-medium truncate max-w-[120px]">
                        {currentUser.email}
                      </div>
                    </div>

                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
                        title="Se déconnecter"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  onOpenAuthModal && (
                    <button
                      onClick={() => onOpenAuthModal()}
                      className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Connexion</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Corps des pages */}
      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      {/* Pied de page (Footer) */}
      {!hideFooter && (
        <footer className={`border-t py-12 text-xs transition-colors duration-200 mt-auto relative z-10 ${
          isDark ? 'bg-[#090A0F]/90 border-white/[0.07] text-slate-400' : 'bg-[#FAFAFC] border-slate-200 text-slate-500'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>SkillHub</span>
              <span>— Plateforme Certifiante d'E-Learning & IA</span>
            </div>

            <div className="flex items-center gap-6 font-medium">
              <button onClick={() => handleNavClick('catalog')} className="hover:text-indigo-400 transition">
                Formations
              </button>
              <button onClick={() => handleNavClick('about')} className="hover:text-indigo-400 transition">
                À propos
              </button>
              <button onClick={() => handleNavClick('contact')} className="hover:text-indigo-400 transition">
                Contact
              </button>
              <button onClick={() => handleNavClick('admin')} className="hover:text-indigo-400 font-semibold text-indigo-500 transition">
                Back-Office Admin
              </button>
            </div>

            <div className="text-slate-400 text-center sm:text-right text-[11px]">
              Firebase Auth Google • Cloud Firestore • Google Gemini • Ariary (Ar)
            </div>
          </div>
        </footer>
      )}

      {/* Assistant Chatbot IA Flottant (SkillBot) */}
      {!hideChatbot && <AIChatbot isDark={isDark} />}
    </div>
  );
}
