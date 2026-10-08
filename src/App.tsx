/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Clock, 
  Star, 
  Award, 
  ChevronRight,
  Heart,
  LogOut,
  Mail,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Trash2,
  Sliders,
  Check,
  Download,
  TrendingUp,
  CheckCircle,
  Flame,
  Sun,
  Moon,
  Play
} from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  setDoc, 
  updateDoc,
  doc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './lib/firebase';
import { Course, Enrollment } from './types';
import { COURSES_DATA } from './lib/coursesData';
import CatalogPage from './app/catalog/page';
import CourseDetailsView from './app/course/[id]/page';
import CourseCard from './components/CourseCard';
import ContactPage from './app/contact/page';
import AboutPage from './app/about/page';
import AIChatbot from './components/AIChatbot';
import CertificateModal from './components/CertificateModal';
import CoursePlayerView from './components/CoursePlayerView';
import ToastContainer, { ToastItem } from './components/ToastContainer';
import AuthModal from './components/AuthModal';
import AdminPortal from './components/AdminPortal';
import Layout from './components/Layout';
import StudentRegistrationPage from './components/StudentRegistrationPage';

type ActiveTab = 'catalog' | 'register' | 'enrollments' | 'favorites' | 'about' | 'contact' | 'course-details' | 'course-player' | 'admin';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [playerEnrollment, setPlayerEnrollment] = useState<Enrollment | null>(null);

  // Catalogue de cours dynamique (synchronisé avec Firestore)
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA);

  // Mode Sombre / Mode Clair (Dark / Light Mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('skillhub_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('skillhub_theme', next ? 'dark' : 'light');
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Détection d'URL directe (/my-courses ou #my-courses pour l'espace d'apprentissage, /register ou #register pour l'inscription)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkRoute = () => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (path === '/my-courses' || hash === '#my-courses' || hash === '#/my-courses') {
          setActiveTab('enrollments');
          setSelectedCourseId(null);
        } else if (
          path === '/register' || 
          path === '/inscription' || 
          hash === '#register' || 
          hash === '#inscription' || 
          hash === '#/register' || 
          hash === '#/inscription'
        ) {
          setActiveTab('register');
          setSelectedCourseId(null);
        }
      };
      checkRoute();
      window.addEventListener('popstate', checkRoute);
      window.addEventListener('hashchange', checkRoute);
      return () => {
        window.removeEventListener('popstate', checkRoute);
        window.removeEventListener('hashchange', checkRoute);
      };
    }
  }, []);

  // Synchronisation en temps réel du catalogue de cours depuis Firebase Firestore
  useEffect(() => {
    try {
      const coursesCollection = collection(db, 'courses');
      const unsubscribe = onSnapshot(coursesCollection, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedCourses: Course[] = [];
          snapshot.forEach((d) => {
            fetchedCourses.push({ ...(d.data() as Course), id: d.id });
          });
          // Conserver également les cours par défaut qui n'ont pas encore été écrasés
          const firestoreIds = new Set(fetchedCourses.map((c) => c.id));
          const merged = [
            ...fetchedCourses,
            ...COURSES_DATA.filter((c) => !firestoreIds.has(c.id)),
          ];
          setCourses(merged);
        } else {
          setCourses(COURSES_DATA);
        }
      }, (err) => {
        console.warn("Écoute cours Firestore (mode hors-ligne actif):", err);
        setCourses((prev) => (prev && prev.length > 0 ? prev : COURSES_DATA));
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Erreur init listener courses:", e);
    }
  }, []);

  // Fonction de rechargement explicite du catalogue
  const handleRefreshCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      if (!snapshot.empty) {
        const fetchedCourses: Course[] = [];
        snapshot.forEach((d) => {
          fetchedCourses.push({ ...(d.data() as Course), id: d.id });
        });
        const firestoreIds = new Set(fetchedCourses.map((c) => c.id));
        const merged = [
          ...fetchedCourses,
          ...COURSES_DATA.filter((c) => !firestoreIds.has(c.id)),
        ];
        setCourses(merged);
      }
    } catch (err) {
      console.warn("Erreur refresh courses Firestore:", err);
    }
  };

  // Authentification Firebase Auth & Mode Démo/Invité
  const [currentUser, setCurrentUser] = useState<User | any | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillhub_user_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Modal d'Authentification Sécurisée (Google, Email, Démo 1-Clic)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>(undefined);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);

  // Firestore Data en temps réel
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Certificat Modal & Wahou
  const [selectedCertificateEnrollment, setSelectedCertificateEnrollment] = useState<Enrollment | null>(null);
  const [unenrollConfirmationId, setUnenrollConfirmationId] = useState<string | null>(null);

  // Filtre de statut des inscriptions ('all' | 'in_progress' | 'completed')
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Système de Toasts multiples & animés
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    message: string, 
    type: 'success' | 'info' | 'error' | 'enroll' | 'unenroll' | 'favorite' = 'success',
    title?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Écoute de l'état d'authentification Google via Firebase Auth + Retour Redirection
  useEffect(() => {
    // Vérifier si un retour de redirection OAuth a eu lieu
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setCurrentUser(result.user);
        addToast(`Ravi de vous revoir, ${result.user.displayName || result.user.email} !`, 'success', 'Connexion Google réussie');
      }
    }).catch((err) => {
      console.warn("Retour redirection Auth:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('skillhub_user_session');
        }
      } else {
        // Ne réinitialiser que si ce n'est pas un profil démo local stocké
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('skillhub_user_session');
          if (!saved) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Écoute temps réel des inscriptions Firestore de l'utilisateur connecté
  useEffect(() => {
    if (!currentUser) {
      setEnrollments([]);
      setEnrollmentsLoading(false);
      return;
    }

    // Si utilisateur mode démo ou session locale invité sans session Firebase Auth active
    if (currentUser.uid?.startsWith('demo_user_') || !auth.currentUser) {
      const stored = localStorage.getItem(`skillhub_enrollments_${currentUser.uid}`);
      if (stored) {
        try {
          setEnrollments(JSON.parse(stored));
        } catch (e) {
          setEnrollments([]);
        }
      } else {
        // Enrôler par défaut une formation pour tester immédiatement
        const defaultCourse = COURSES_DATA[0];
        const defaultEnrollment: Enrollment = {
          id: `${currentUser.uid}_${defaultCourse.id}`,
          userId: currentUser.uid,
          courseId: defaultCourse.id,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          progress: 40,
          completedLessonIds: defaultCourse.modules?.[0]?.lessons?.slice(0, 1).map((l) => l.id) || [],
          lastAccessedAt: "Aujourd'hui",
          courseSnapshot: {
            title: defaultCourse.title,
            thumbnail: defaultCourse.thumbnail,
            category: defaultCourse.category,
            price: defaultCourse.price,
            durationMinutes: defaultCourse.durationMinutes,
            instructorName: defaultCourse.instructor.name,
            level: defaultCourse.level,
          },
        };
        setEnrollments([defaultEnrollment]);
        localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify([defaultEnrollment]));
      }
      setEnrollmentsLoading(false);
      return;
    }

    setEnrollmentsLoading(true);
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Enrollment[] = [];
        const savedGlobalName = typeof window !== 'undefined' ? localStorage.getItem('skillhub_preferred_student_name') : null;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const studentName = data.studentName || data.userDisplayName || savedGlobalName || '';
          loaded.push({
            id: docSnap.id,
            userId: data.userId,
            userEmail: data.userEmail || currentUser.email || '',
            userDisplayName: studentName || currentUser.displayName || '',
            studentName: studentName,
            courseId: data.courseId,
            enrolledAt: data.enrolledAt,
            status: data.status || 'active',
            progress: typeof data.progress === 'number' ? data.progress : 0,
            completedLessonIds: data.completedLessonIds || [],
            lastAccessedAt: data.lastAccessedAt || 'Récemment',
            courseSnapshot: data.courseSnapshot,
          });
        });
        setEnrollments(loaded);
        setEnrollmentsLoading(false);
      },
      (error) => {
        console.warn('Erreur écoute Firestore enrollments, bascule locale:', error);
        setEnrollmentsLoading(false);
        const stored = localStorage.getItem(`skillhub_enrollments_${currentUser.uid}`);
        if (stored) {
          try {
            setEnrollments(JSON.parse(stored));
          } catch (e) {
            // ignore
          }
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Écoute temps réel des favoris de l'utilisateur
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    if (currentUser.uid?.startsWith('demo_user_') || !auth.currentUser) {
      const stored = localStorage.getItem(`skillhub_favorites_${currentUser.uid}`);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          setFavorites([]);
        }
      } else {
        setFavorites([COURSES_DATA[1]?.id]);
      }
      return;
    }

    const favQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      favQuery,
      (snapshot) => {
        const favIds: string[] = [];
        snapshot.forEach((d) => {
          favIds.push(d.data().courseId);
        });
        setFavorites(favIds);
      },
      (err) => {
        console.warn('Erreur écoute favoris Firestore, bascule locale:', err);
        const stored = localStorage.getItem(`skillhub_favorites_${currentUser.uid}`);
        if (stored) {
          try {
            setFavorites(JSON.parse(stored));
          } catch (e) {
            // ignore
          }
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Connexion Google via Popup avec gestion irréprochable de popup-blocked
  const handleGoogleSignIn = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser(user);
      setIsPopupBlocked(false);
      setIsAuthModalOpen(false);
      addToast(`Ravi de vous revoir, ${user.displayName || user.email} !`, 'success', 'Connexion réussie');
    } catch (err: any) {
      console.warn('Google Sign-In response code:', err?.code, err?.message);
      if (auth.currentUser) {
        setCurrentUser(auth.currentUser);
        setIsPopupBlocked(false);
        setIsAuthModalOpen(false);
        addToast(`Ravi de vous revoir, ${auth.currentUser.displayName || auth.currentUser.email} !`, 'success', 'Connexion réussie');
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setIsPopupBlocked(true);
        setAuthModalReason("La fenêtre pop-up Google a été bloquée par votre navigateur ou l'environnement iframe. Choisissez une option ci-dessous pour continuer.");
        setIsAuthModalOpen(true);
        addToast("Pop-up bloquée par le navigateur. Options de connexion ouvertes.", 'info', 'Pop-up bloquée');
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // Fenêtre fermée par l'utilisateur
      } else if (err?.message?.includes('Pending promise was never set') || err?.message?.includes('INTERNAL ASSERTION FAILED')) {
        // Assertion interne SDK interceptée
        setAuthModalReason("Connexion alternative disponible ci-dessous.");
        setIsAuthModalOpen(true);
      } else {
        setAuthModalReason("Connexion alternative disponible ci-dessous.");
        setIsAuthModalOpen(true);
        addToast("Erreur d'authentification. Options alternatives ouvertes.", 'error', 'Authentification');
      }
    }
  };

  // Déconnexion
  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('skillhub_user_session');
      }
      setCurrentUser(null);
      addToast('Vous avez été déconnecté avec succès.', 'info', 'À bientôt');
      if (activeTab === 'enrollments' || activeTab === 'favorites' || activeTab === 'course-player') {
        setActiveTab('catalog');
      }
    } catch (err: any) {
      console.error('Erreur déconnexion:', err);
    }
  };

  // Inscription ou actualisation d'une formation (Firestore ou Mode Démo)
  const handleEnrollCourse = async (
    course: Course,
    studentInfo?: { name?: string; email?: string; phone?: string }
  ) => {
    if (!currentUser) {
      setAuthModalReason(`Connectez-vous pour vous inscrire à la formation "${course.title}".`);
      setIsAuthModalOpen(true);
      return;
    }

    const finalStudentName = studentInfo?.name?.trim() || currentUser.displayName || '';
    const finalStudentEmail = studentInfo?.email?.trim() || currentUser.email || '';

    // Si l'étudiant est déjà inscrit à cette formation, on met à jour son nom sur le certificat
    const existingEnrollment = enrollments.find((e) => e.courseId === course.id);
    if (existingEnrollment) {
      const updatedEnrollments = enrollments.map((e) => {
        if (e.id === existingEnrollment.id) {
          return {
            ...e,
            studentName: finalStudentName || e.studentName,
            userDisplayName: finalStudentName || e.userDisplayName,
            userEmail: finalStudentEmail || e.userEmail,
          };
        }
        return e;
      });
      setEnrollments(updatedEnrollments);

      if (currentUser.uid?.startsWith('demo_user_')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify(updatedEnrollments));
        }
      } else {
        try {
          await updateDoc(doc(db, 'enrollments', existingEnrollment.id), {
            studentName: finalStudentName || existingEnrollment.studentName || '',
            userDisplayName: finalStudentName || existingEnrollment.userDisplayName || '',
            userEmail: finalStudentEmail || existingEnrollment.userEmail || '',
          });
        } catch (err) {
          console.warn("Mise à jour nom inscription Firestore:", err);
        }
      }

      if (selectedCertificateEnrollment && selectedCertificateEnrollment.id === existingEnrollment.id) {
        setSelectedCertificateEnrollment({
          ...selectedCertificateEnrollment,
          studentName: finalStudentName || selectedCertificateEnrollment.studentName,
          userDisplayName: finalStudentName || selectedCertificateEnrollment.userDisplayName,
        });
      }

      if (finalStudentName && typeof window !== 'undefined') {
        localStorage.setItem('skillhub_preferred_student_name', finalStudentName);
      }
      addToast(`Le nom sur votre certificat pour "${course.title}" a été mis à jour : ${finalStudentName}.`, 'success', 'Certificat actualisé');
      return;
    }

    const enrollmentDocId = `${currentUser.uid}_${course.id}`;
    const newEnrollmentData: Enrollment = {
      id: enrollmentDocId,
      userId: currentUser.uid,
      userEmail: finalStudentEmail,
      userDisplayName: finalStudentName,
      studentName: finalStudentName,
      courseId: course.id,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      completedLessonIds: [],
      lastAccessedAt: "À l'instant",
      courseSnapshot: {
        title: course.title,
        thumbnail: course.thumbnail,
        category: course.category,
        price: course.price,
        durationMinutes: course.durationMinutes,
        instructorName: course.instructor.name,
        level: course.level,
      }
    };

    // Mode démo local
    if (currentUser.uid?.startsWith('demo_user_')) {
      const updated = [newEnrollmentData, ...enrollments];
      setEnrollments(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify(updated));
      }
      addToast(`🎉 Félicitations ! Inscription validée pour "${course.title}". Rendez-vous dans "Mes Inscriptions" !`, 'enroll', 'Inscription validée');
      return;
    }

    try {
      await setDoc(doc(db, 'enrollments', enrollmentDocId), {
        ...newEnrollmentData,
        createdAt: serverTimestamp(),
      });
      addToast(`🎉 Félicitations ! Inscription confirmée pour "${course.title}". Rendez-vous dans votre espace pour commencer !`, 'enroll', 'Inscription validée');
    } catch (err: any) {
      console.error('Erreur enregistrement inscription Firestore:', err);
      // Fallback local en cas d'erreur de règles Firestore
      const updated = [newEnrollmentData, ...enrollments];
      setEnrollments(updated);
      addToast(`🎉 Inscription validée localement pour "${course.title}".`, 'enroll', 'Inscription validée');
    }
  };

  // Mise à jour explicite du nom de l'étudiant pour la délivrance du certificat officiel
  const handleUpdateStudentName = async (enrollmentId: string, newName: string) => {
    if (!newName.trim()) return;
    const cleanName = newName.trim();

    const updated = enrollments.map((e) => {
      if (e.id === enrollmentId) {
        return {
          ...e,
          studentName: cleanName,
          userDisplayName: cleanName,
        };
      }
      return e;
    });
    setEnrollments(updated);

    if (currentUser?.uid?.startsWith('demo_user_')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify(updated));
      }
    } else {
      try {
        await updateDoc(doc(db, 'enrollments', enrollmentId), {
          studentName: cleanName,
          userDisplayName: cleanName,
        });
      } catch (err) {
        console.warn("Mise à jour nom certificat Firestore:", err);
      }
    }

    if (selectedCertificateEnrollment && selectedCertificateEnrollment.id === enrollmentId) {
      setSelectedCertificateEnrollment({
        ...selectedCertificateEnrollment,
        studentName: cleanName,
        userDisplayName: cleanName,
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('skillhub_preferred_student_name', cleanName);
    }

    addToast(`Nom mis à jour sur votre certificat officiel : ${cleanName}`, 'success', 'Certificat mis à jour');
  };

  // Se désinscrire d'un cours (Suppression du document Firestore)
  const handleUnenrollCourse = async (enrollmentId: string, courseTitle: string) => {
    if (!currentUser) return;

    if (currentUser.uid?.startsWith('demo_user_')) {
      const updated = enrollments.filter((e) => e.id !== enrollmentId);
      setEnrollments(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify(updated));
      }
      setUnenrollConfirmationId(null);
      addToast(`Vous vous êtes désinscrit de "${courseTitle}". Vos données d'avancement ont été réinitialisées.`, 'unenroll', 'Désinscription effectuée');
      return;
    }

    try {
      await deleteDoc(doc(db, 'enrollments', enrollmentId));
      setUnenrollConfirmationId(null);
      addToast(`Vous vous êtes désinscrit de la formation "${courseTitle}". Vos données d'avancement ont été réinitialisées.`, 'unenroll', 'Désinscription effectuée');
    } catch (err) {
      console.error('Erreur désinscription Firestore:', err);
      const updated = enrollments.filter((e) => e.id !== enrollmentId);
      setEnrollments(updated);
      setUnenrollConfirmationId(null);
      addToast(`Désinscription effectuée pour "${courseTitle}".`, 'unenroll', 'Désinscription effectuée');
    }
  };

  // Modification interactive de la progression (Curseur / Slider ou paliers rapides)
  const handleSetExactProgress = async (enrollmentId: string, newProgress: number, courseTitle: string) => {
    if (!currentUser) return;
    const clamped = Math.max(0, Math.min(100, newProgress));

    if (currentUser.uid?.startsWith('demo_user_')) {
      const updated = enrollments.map((e) => 
        e.id === enrollmentId 
          ? { ...e, progress: clamped, status: clamped === 100 ? ('completed' as const) : ('active' as const), lastAccessedAt: "Aujourd'hui" } 
          : e
      );
      setEnrollments(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify(updated));
      }

      if (clamped === 100) {
        addToast(`🏆 100% de complétion atteint sur "${courseTitle}" ! Votre certificat officiel de réussite est désormais disponible.`, 'success', 'Félicitations');
        const target = updated.find((e) => e.id === enrollmentId);
        if (target) {
          setSelectedCertificateEnrollment(target);
        }
      } else {
        addToast(`Progression synchronisée : ${clamped}%`, 'info', 'Avancement mis à jour');
      }
      return;
    }

    try {
      await setDoc(
        doc(db, 'enrollments', enrollmentId),
        { 
          progress: clamped,
          status: clamped === 100 ? 'completed' : 'active',
          lastAccessedAt: "Aujourd'hui"
        },
        { merge: true }
      );

      if (clamped === 100) {
        addToast(`🏆 100% de complétion atteint sur "${courseTitle}" ! Votre certificat officiel de réussite est désormais disponible.`, 'success', 'Félicitations');
        const targetEnrollment = enrollments.find((e) => e.id === enrollmentId);
        if (targetEnrollment) {
          setSelectedCertificateEnrollment({
            ...targetEnrollment,
            progress: 100,
            status: 'completed',
          });
        }
      } else {
        addToast(`Progression synchronisée : ${clamped}%`, 'info', 'Avancement mis à jour');
      }
    } catch (err) {
      console.error('Erreur progression Firestore:', err);
      // Fallback local fluide
      const updated = enrollments.map((e) => 
        e.id === enrollmentId 
          ? { ...e, progress: clamped, status: clamped === 100 ? ('completed' as const) : ('active' as const), lastAccessedAt: "Aujourd'hui" } 
          : e
      );
      setEnrollments(updated);
      if (clamped === 100) {
        const target = updated.find((e) => e.id === enrollmentId);
        if (target) setSelectedCertificateEnrollment(target);
      }
    }
  };

  // Mise à jour de la progression depuis le lecteur immersif (leçons et quiz)
  const handleUpdatePlayerProgress = async (newProgress: number, completedLessonIds: string[], completedQuizIds?: string[]) => {
    if (!currentUser || !playerEnrollment) return;
    const clamped = Math.max(0, Math.min(100, newProgress));

    const updatedPlayer: Enrollment = {
      ...playerEnrollment,
      progress: clamped,
      completedLessonIds: completedLessonIds,
      completedQuizIds: completedQuizIds || playerEnrollment.completedQuizIds || [],
      status: clamped === 100 ? 'completed' : 'active',
      lastAccessedAt: "À l'instant",
    };
    setPlayerEnrollment(updatedPlayer);

    if (currentUser.uid?.startsWith('demo_user_')) {
      const updatedList = enrollments.map((e) => e.id === playerEnrollment.id ? updatedPlayer : e);
      setEnrollments(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`skillhub_enrollments_${currentUser.uid}`, JSON.stringify(updatedList));
      }

      if (clamped === 100) {
        addToast(`🎉 Vous avez validé tous les modules et quiz ! Votre certificat est prêt.`, 'success', 'Certificat Débloqué');
        setSelectedCertificateEnrollment(updatedPlayer);
      }
      return;
    }

    try {
      await setDoc(
        doc(db, 'enrollments', playerEnrollment.id),
        {
          progress: clamped,
          completedLessonIds: completedLessonIds,
          completedQuizIds: completedQuizIds || playerEnrollment.completedQuizIds || [],
          status: clamped === 100 ? 'completed' : 'active',
          lastAccessedAt: "À l'instant",
        },
        { merge: true }
      );

      if (clamped === 100) {
        addToast(`🎉 Vous avez validé tous les modules et quiz ! Votre certificat est prêt.`, 'success', 'Certificat Débloqué');
        setSelectedCertificateEnrollment(updatedPlayer);
      }
    } catch (err) {
      console.error('Erreur sync lecture:', err);
    }
  };

  // Gestion des favoris avec mise à jour optimiste et tolérance aux pannes
  const handleToggleFavorite = async (course: Course) => {
    if (!currentUser) {
      setAuthModalReason(`Connectez-vous pour ajouter "${course.title}" à vos favoris.`);
      setIsAuthModalOpen(true);
      return;
    }

    const isFav = favorites.includes(course.id);
    const nextFavorites = isFav 
      ? favorites.filter((id) => id !== course.id) 
      : [...favorites, course.id];

    // Mise à jour optimiste instantanée dans l'interface et le stockage local
    setFavorites(nextFavorites);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`skillhub_favorites_${currentUser.uid}`, JSON.stringify(nextFavorites));
    }

    if (isFav) {
      addToast(`La formation "${course.title}" a été retirée de votre liste de favoris.`, 'info', 'Favoris mis à jour');
    } else {
      addToast(`"${course.title}" a été ajoutée à vos favoris avec succès !`, 'favorite', 'Ajouté aux favoris');
    }

    // Si utilisateur en mode démo ou pas de token Firebase Auth actif
    if (!auth.currentUser || currentUser.uid?.startsWith('demo_user_')) {
      return;
    }

    // Synchronisation avec Firebase Firestore pour les utilisateurs connectés
    const favDocId = `${currentUser.uid}_${course.id}`;
    try {
      if (isFav) {
        await deleteDoc(doc(db, 'favorites', favDocId));
      } else {
        await setDoc(doc(db, 'favorites', favDocId), {
          userId: currentUser.uid,
          courseId: course.id,
          addedAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.warn('Synchronisation favoris Firestore non bloquante:', err?.message || err);
      // L'expérience utilisateur reste fluide grâce au stockage local optimiste
    }
  };

  // Naviguer vers la page détails d'un cours
  const handleOpenCourseDetails = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('course-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lancer l'interface de lecture immersive pour un cours
  const handleOpenPlayer = (enrollment: Enrollment) => {
    setPlayerEnrollment(enrollment);
    setActiveTab('course-player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  // Si on est dans le lecteur immersif, afficher la vue plein écran dédiée
  if (activeTab === 'course-player' && playerEnrollment) {
    const course = courses.find((c) => c.id === playerEnrollment.courseId) || courses[0];
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-[#090A0F] text-white' : 'bg-[#0B0D13] text-white'}`}>
        <CoursePlayerView
          course={course}
          enrollment={playerEnrollment}
          onUpdateProgress={handleUpdatePlayerProgress}
          onOpenCertificate={() => {
            const fresh = enrollments.find((e) => e.courseId === playerEnrollment.courseId) || playerEnrollment;
            setSelectedCertificateEnrollment(fresh);
          }}
          onBack={() => setActiveTab('enrollments')}
          isDark={isDark}
        />
        {selectedCertificateEnrollment && (
          <CertificateModal
            enrollment={selectedCertificateEnrollment}
            userName={
              selectedCertificateEnrollment.studentName ||
              selectedCertificateEnrollment.userDisplayName ||
              currentUser?.displayName ||
              currentUser?.email ||
              'Apprenant SkillHub'
            }
            onClose={() => setSelectedCertificateEnrollment(null)}
            onUpdateStudentName={handleUpdateStudentName}
          />
        )}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialPopupBlocked={isPopupBlocked}
          reason={authModalReason}
          isDark={isDark}
          onSuccess={(user, message) => {
            setCurrentUser(user);
            if (user.uid?.startsWith('demo_user_')) {
              if (typeof window !== 'undefined') {
                localStorage.setItem('skillhub_user_session', JSON.stringify(user));
              }
            }
            if (message) {
              addToast(message, 'success', 'Connexion réussie');
            }
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} isDark={true} />
        {/* Tuteur SkillBot IA disponible en direct dans le lecteur */}
        <AIChatbot 
          courseContext={{ 
            courseTitle: course.title,
            currentModuleTitle: course.modules?.[0]?.title,
            currentLessonTitle: course.modules?.[0]?.lessons?.[0]?.title
          }}
          isDark={true}
        />
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onNavigate={(tab) => {
        if (tab === 'catalog') {
          setActiveTab('catalog');
          setSelectedCourseId(null);
          const scrollToHero = () => {
            if (typeof window !== 'undefined') {
              const hero = document.getElementById('catalog-hero-title');
              if (hero) {
                hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          };
          scrollToHero();
          setTimeout(scrollToHero, 50);
          setTimeout(scrollToHero, 150);
          return;
        }
        setActiveTab(tab as ActiveTab);
        setSelectedCourseId(null);
      }}
      currentUser={currentUser}
      authLoading={authLoading}
      onOpenAuthModal={(reason) => {
        setIsPopupBlocked(false);
        setAuthModalReason(reason);
        setIsAuthModalOpen(true);
      }}
      onSignOut={handleSignOut}
      enrollmentsCount={enrollments.length}
      favoritesCount={favorites.length}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      toasts={toasts}
      onDismissToast={removeToast}
      selectedCertificateEnrollment={selectedCertificateEnrollment}
      onCloseCertificateModal={() => setSelectedCertificateEnrollment(null)}
      onUpdateStudentName={handleUpdateStudentName}
      isAuthModalOpen={isAuthModalOpen}
      onCloseAuthModal={() => setIsAuthModalOpen(false)}
      isPopupBlocked={isPopupBlocked}
      authModalReason={authModalReason}
      onAuthSuccess={(user, message) => {
        setCurrentUser(user);
        if (user.uid?.startsWith('demo_user_')) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('skillhub_user_session', JSON.stringify(user));
          }
        }
        if (message) {
          addToast(message, 'success', 'Connexion réussie');
        }
      }}
    >
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
        {activeTab === 'catalog' && (
          <CatalogPage
            courses={courses}
            onSelectCourse={handleOpenCourseDetails}
            onGoToRegistration={(courseId) => {
              if (courseId) setSelectedCourseId(courseId);
              setActiveTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            enrolledCourseIds={enrolledCourseIds}
            favoriteCourseIds={favorites}
            onToggleFavorite={handleToggleFavorite}
            isDark={isDark}
          />
        )}

        {activeTab === 'register' && (
          <StudentRegistrationPage
            courses={courses}
            enrolledCourseIds={enrolledCourseIds}
            initialCourseId={selectedCourseId}
            currentUser={currentUser}
            onEnrollCourse={handleEnrollCourse}
            onGoToLearningSpace={() => {
              setActiveTab('enrollments');
              setSelectedCourseId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartLearning={(courseId) => {
              const enr = enrollments.find((e) => e.courseId === courseId);
              if (enr) {
                handleOpenPlayer(enr);
              } else {
                setActiveTab('enrollments');
                setSelectedCourseId(null);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuthModal={(reason) => {
              setAuthModalReason(reason);
              setIsAuthModalOpen(true);
            }}
            onBackToCatalog={() => {
              setActiveTab('catalog');
              setSelectedCourseId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isDark={isDark}
          />
        )}

        {activeTab === 'course-details' && selectedCourseId && (
          <CourseDetailsView
            coursesList={courses}
            courseId={selectedCourseId}
            currentUser={currentUser}
            isEnrolled={enrolledCourseIds.includes(selectedCourseId)}
            isFavorite={favorites.includes(selectedCourseId)}
            onEnroll={handleEnrollCourse}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => {
              setActiveTab('catalog');
              setSelectedCourseId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToLearningSpace={() => {
              setActiveTab('enrollments');
              setSelectedCourseId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToRegistration={(courseId) => {
              setSelectedCourseId(courseId);
              setActiveTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartLearning={(courseId) => {
              const enr = enrollments.find((e) => e.courseId === courseId);
              if (enr) {
                handleOpenPlayer(enr);
              } else {
                setActiveTab('enrollments');
                setSelectedCourseId(null);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenLogin={() => {
              setAuthModalReason('Connectez-vous pour rejoindre cette formation.');
              setIsAuthModalOpen(true);
            }}
            isDark={isDark}
          />
        )}

        {activeTab === 'enrollments' && (() => {
          // Calcul des statistiques d'apprentissage
          const totalEnrollments = enrollments.length;
          const completedEnrollments = enrollments.filter((e) => e.progress >= 100).length;
          const inProgressEnrollments = enrollments.filter((e) => e.progress < 100).length;
          const averageCompletion = totalEnrollments > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments)
            : 0;

          // Filtrage selon le statut sélectionné
          const displayedEnrollments = enrollments.filter((e) => {
            if (enrollmentStatusFilter === 'completed') return e.progress >= 100;
            if (enrollmentStatusFilter === 'in_progress') return e.progress < 100;
            return true;
          });

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {/* En-tête compact de l'espace apprenant */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono tracking-wider uppercase text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Espace Apprenant Officiel</span>
                  </div>
                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Mon espace d'apprentissage
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Retrouvez l'ensemble de vos formations suivies, reprenez vos cours là où vous vous étiez arrêté et téléchargez vos certificats.
                  </p>
                </div>

                {totalEnrollments > 0 && (
                  <div className={`px-4 py-2 rounded-2xl border text-xs font-mono shadow-2xs flex items-center gap-2 self-start sm:self-auto ${
                    isDark ? 'bg-[#10131E] border-white/[0.08] text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Synchronisé Firestore</span>
                  </div>
                )}
              </div>

              {/* BANDEAU HORIZONTAL COMPACT ET ÉLÉGANT */}
              {totalEnrollments > 0 && (
                <div className={`mb-6 p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${
                  isDark
                    ? 'bg-[#10131E] border-white/[0.08]'
                    : 'bg-white border-slate-200/90'
                }`}>
                  {/* Métriques horizontales réparties */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 w-full md:w-auto items-center">
                    {/* Stat 1 : Total */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {totalEnrollments}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Formations
                        </div>
                      </div>
                    </div>

                    {/* Stat 2 : En cours */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-sky-500">
                          {inProgressEnrollments}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          En cours
                        </div>
                      </div>
                    </div>

                    {/* Stat 3 : Terminés */}
                    <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-emerald-500">
                          {completedEnrollments}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Certifiés (100%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Droite : Taux de complétion global compact avec jauge fine */}
                  <div className="w-full md:w-72 pl-0 md:pl-6 md:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                        Complétion globale
                      </span>
                      <span className="text-amber-500 font-extrabold">{averageCompletion}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${averageCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Onglets de filtrage par statut ('Tous', 'En cours', 'Terminés') */}
              {totalEnrollments > 0 && (
                <div className={`flex flex-wrap items-center justify-between gap-3 mb-6 p-2 sm:p-2.5 rounded-2xl border transition-colors ${
                  isDark ? 'bg-[#10131E] border-white/[0.08] shadow-lg' : 'bg-white border-slate-200/90 shadow-2xs'
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setEnrollmentStatusFilter('all')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                        enrollmentStatusFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>Tous</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        enrollmentStatusFilter === 'all' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {totalEnrollments}
                      </span>
                    </button>

                    <button
                      onClick={() => setEnrollmentStatusFilter('in_progress')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                        enrollmentStatusFilter === 'in_progress'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>En cours</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        enrollmentStatusFilter === 'in_progress' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-sky-400' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {inProgressEnrollments}
                      </span>
                    </button>

                    <button
                      onClick={() => setEnrollmentStatusFilter('completed')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                        enrollmentStatusFilter === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Terminés (Certifiés)</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        enrollmentStatusFilter === 'completed' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {completedEnrollments}
                      </span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 hidden sm:inline px-3 font-medium">
                    {displayedEnrollments.length} formation{displayedEnrollments.length > 1 ? 's' : ''} affichée{displayedEnrollments.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {enrollmentsLoading ? (
                <div className={`p-16 text-center rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Chargement de vos formations en temps réel...</p>
                </div>
              ) : displayedEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedEnrollments.map((enr) => {
                    const course = COURSES_DATA.find((c) => c.id === enr.courseId);
                    const title = enr.courseSnapshot?.title || course?.title || 'Formation';
                    const thumb = enr.courseSnapshot?.thumbnail || course?.thumbnail || '';
                    const instructor = enr.courseSnapshot?.instructorName || course?.instructor.name || 'Formateur SkillHub';
                    const isCompleted = enr.progress >= 100;
                    const isConfirmingUnenroll = unenrollConfirmationId === enr.id;

                    return (
                      <div
                        key={enr.id}
                        className={`rounded-3xl border transition-all flex flex-col justify-between p-5 relative overflow-hidden ${
                          isDark
                            ? isCompleted 
                              ? 'bg-[#10131E] border-amber-500/40 shadow-xl shadow-amber-500/5' 
                              : 'bg-[#10131E] border-white/[0.08] shadow-md hover:border-white/[0.18]'
                            : isCompleted 
                              ? 'bg-white border-amber-300 shadow-lg shadow-amber-500/10' 
                              : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Badge si 100% complété */}
                        {isCompleted && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1 z-10">
                            <Award className="w-3.5 h-3.5" />
                            <span>Terminé à 100%</span>
                          </div>
                        )}

                        <div>
                          {/* Image miniature avec overlay de lecture immersif */}
                          <div 
                            onClick={() => handleOpenPlayer(enr)}
                            className="aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-slate-950 relative group cursor-pointer"
                            title="Ouvrir le lecteur immersif de cette formation"
                          >
                            <img 
                              src={thumb || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                              alt={title} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-80 group-hover:opacity-100">
                              <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 fill-white translate-x-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded backdrop-blur-md">
                              {enr.courseSnapshot?.category || 'Formation'}
                            </span>
                          </div>

                          {/* Titre & Formateur */}
                          <h3 
                            onClick={() => handleOpenPlayer(enr)}
                            className={`font-bold text-base line-clamp-2 mb-1 cursor-pointer transition hover:text-indigo-400 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {title}
                          </h3>
                          <p className="text-xs text-slate-400 mb-4">Par {instructor}</p>

                          {/* Contrôle interactif de progression */}
                          <div className={`p-3.5 rounded-2xl border mb-4 space-y-2 ${
                            isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                          }`}>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                                Progression
                              </span>
                              <span className={`font-black ${isCompleted ? 'text-amber-500' : 'text-indigo-500'}`}>
                                {enr.progress}%
                              </span>
                            </div>

                            {/* Curseur interactif (Slider) */}
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={enr.progress}
                              onChange={(e) => handleSetExactProgress(enr.id, parseInt(e.target.value, 10), title)}
                              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-700/40 rounded-lg"
                              title="Glissez pour simuler votre progression"
                            />

                            {/* Paliers rapides */}
                            <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
                              <button
                                onClick={() => handleSetExactProgress(enr.id, 35, title)}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  enr.progress === 35 
                                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold' 
                                    : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                35%
                              </button>
                              <button
                                onClick={() => handleSetExactProgress(enr.id, 50, title)}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  enr.progress === 50 
                                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold' 
                                    : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                50%
                              </button>
                              <button
                                onClick={() => handleSetExactProgress(enr.id, 75, title)}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  enr.progress === 75 
                                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold' 
                                    : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                75%
                              </button>
                              <button
                                onClick={() => handleSetExactProgress(enr.id, 100, title)}
                                className={`px-2.5 py-0.5 rounded-lg border font-bold transition flex items-center gap-1 ${
                                  isCompleted 
                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs' 
                                    : isDark ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/30' : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                                }`}
                              >
                                <Sparkles className="w-3 h-3" />
                                100%
                              </button>
                            </div>
                          </div>

                          {/* Bouton Certificat interactif si 100% */}
                          {isCompleted && (
                            <div className="mb-4">
                              <button
                                onClick={() => setSelectedCertificateEnrollment(enr)}
                                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm transform active:scale-98 transition duration-200 animate-pulse"
                              >
                                <Award className="w-4 h-4 text-slate-950" />
                                <span>Télécharger le certificat</span>
                                <Sparkles className="w-4 h-4 text-slate-950" />
                              </button>
                            </div>
                          )}

                          {/* Bouton d'accès au lecteur immersif */}
                          <div className="mb-4">
                            <button
                              onClick={() => handleOpenPlayer(enr)}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                                isDark
                                  ? 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Ouvrir l'espace cours & vidéos</span>
                            </button>
                          </div>
                        </div>

                        {/* Actions inférieures : Détails + Se désinscrire */}
                        <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                          isDark ? 'border-slate-800' : 'border-slate-100'
                        }`}>
                          <button
                            onClick={() => handleOpenCourseDetails(enr.courseId)}
                            className="font-semibold text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                          >
                            <span>Détails</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Confirmation de désinscription */}
                          {isConfirmingUnenroll ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                              <span className="text-[11px] text-rose-500 font-semibold">Sûr ?</span>
                              <button
                                onClick={() => handleUnenrollCourse(enr.id, title)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 transition"
                              >
                                Oui, retirer
                              </button>
                              <button
                                onClick={() => setUnenrollConfirmationId(null)}
                                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] hover:bg-slate-700"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setUnenrollConfirmationId(enr.id)}
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-rose-500/10"
                              title="Se désinscrire de ce cours"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Se désinscrire</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : !currentUser ? (
                <div className={`rounded-3xl border p-12 text-center max-w-md mx-auto ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Espace Étudiant
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6">
                    Connectez-vous pour retrouver l'ensemble de vos cours inscrits, reprendre vos leçons et télécharger vos certificats de réussite.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalReason('Connectez-vous pour accéder à vos formations et certificats.');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20"
                  >
                    Se connecter à mon compte
                  </button>
                </div>
              ) : (
                <div className={`rounded-3xl border p-12 text-center max-w-md mx-auto ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {totalEnrollments > 0
                      ? 'Aucune formation pour ce filtre'
                      : 'Aucun cours inscrit pour le moment'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6">
                    {totalEnrollments > 0
                      ? enrollmentStatusFilter === 'completed'
                        ? 'Vous n\'avez pas encore terminé de cours à 100%. Poursuivez votre formation !'
                        : 'Aucun cours en cours d\'apprentissage avec ce filtre.'
                      : 'Vous n\'avez pas encore rejoint de formation. Parcourez notre catalogue et commencez à apprendre en un clic !'}
                  </p>
                  {totalEnrollments > 0 ? (
                    <button
                      onClick={() => setEnrollmentStatusFilter('all')}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-indigo-700 transition"
                    >
                      Voir toutes mes inscriptions
                    </button>
                  ) : (
                    <button
                      onClick={() => { setActiveTab('catalog'); setSelectedCourseId(null); }}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20"
                    >
                      Découvrir les formations
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === 'favorites' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-2 mb-2 text-rose-500 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>Votre Liste d'Envies</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Formations Mises en Favoris
            </h1>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {courses.filter((c) => favorites.includes(c.id)).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    isFavorite={true}
                    onSelectCourse={handleOpenCourseDetails}
                    onToggleFavorite={handleToggleFavorite}
                    isDark={isDark}
                  />
                ))}
              </div>
            ) : (
              <div className={`rounded-3xl border p-12 text-center max-w-md mx-auto ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Aucun favori enregistré</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Cliquez sur le cœur sur les cartes du catalogue pour mémoriser les cours qui vous intéressent.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
                >
                  Aller au catalogue
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <AboutPage 
            onNavigateCatalog={() => { setActiveTab('catalog'); setSelectedCourseId(null); }} 
            isDark={isDark}
          />
        )}

        {activeTab === 'contact' && (
          <ContactPage 
            onSuccessToast={(msg) => addToast(msg, 'success', 'Message envoyé')} 
            isDark={isDark}
          />
        )}

        {/* Console d'Administration Back-Office */}
        {activeTab === 'admin' && (
          <AdminPortal
            courses={courses}
            currentUser={currentUser}
            totalEnrollmentsCount={enrollments.length}
            onRefreshCourses={handleRefreshCourses}
            onSelectCourse={handleOpenCourseDetails}
            showToast={addToast}
            isDark={isDark}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
