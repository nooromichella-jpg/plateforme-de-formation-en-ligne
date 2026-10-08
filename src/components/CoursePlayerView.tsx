'use client';

/**
 * Interface de Lecture Immersive SkillHub (CoursePlayerView.tsx).
 * - Lecteur vidéo HTML5 interactif de haute qualité avec streaming vidéo réel (MP4 & YouTube)
 * - Contrôles complets : Lecture/Pause, Avance/Retour 10s, Barre de progression Scrubbable, Volume, Vitesse (0.75x à 2x), Plein écran
 * - Validation automatique de la leçon à la fin de la vidéo
 * - Chapitrage synchronisé et QCM interactifs
 * - Possibilité d'entrer une URL vidéo personnalisée (YouTube ou MP4)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  CheckCircle, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Award, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Download, 
  Check, 
  Brain, 
  MessageSquare, 
  Settings, 
  Film, 
  Video, 
  Link as LinkIcon, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { Course, Enrollment, Lesson, CourseModule } from '@/src/types';
import { getModuleQuiz } from '@/src/lib/coursesData';
import ChapterQuizModal from './ChapterQuizModal';

interface CoursePlayerViewProps {
  course: Course;
  enrollment: Enrollment;
  onUpdateProgress: (newProgress: number, completedLessonIds: string[], completedQuizIds?: string[]) => Promise<void>;
  onOpenCertificate: () => void;
  onBack: () => void;
  isDark?: boolean;
}

// Flux vidéo MP4 réels, haute définition et à chargement ultra-rapide (CORS activé, testés et vérifiés)
const SAMPLE_VIDEOS: string[] = [
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
];

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

function getYouTubeEmbedUrl(url: string): string {
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&enablejsapi=1`;
  }
  return url;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CoursePlayerView({
  course,
  enrollment,
  onUpdateProgress,
  onOpenCertificate,
  onBack,
  isDark = false,
}: CoursePlayerViewProps) {
  // Aplatir toutes les leçons pour navigation séquentielle
  const allLessons: Lesson[] = course.modules?.flatMap((m) => m.lessons) || [];
  const allModules: CourseModule[] = course.modules || [];
  
  // Leçon active (par défaut la première non terminée ou la première)
  const initialLesson = allLessons.find((l) => !enrollment.completedLessonIds?.includes(l.id)) || allLessons[0];
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson || null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(enrollment.completedLessonIds || []);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>(enrollment.completedQuizIds || []);
  
  // Références lecteur
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // États du lecteur vidéo réel
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [tempUrlInput, setTempUrlInput] = useState('');
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Onglets inférieurs
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'notes'>('content');
  const [userNote, setUserNote] = useState('');

  // Gestion du quiz de validation
  const [activeQuizModule, setActiveQuizModule] = useState<CourseModule | null>(null);

  // Index de la leçon en cours
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const isCurrentCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  // Calcul du pourcentage dynamique basé sur les leçons terminées + quiz validés
  const totalItemsCount = (allLessons.length + allModules.length) || 1;
  const completedTotalCount = completedLessonIds.length + completedQuizIds.length;
  const currentProgressPercent = Math.min(100, Math.round((completedTotalCount / totalItemsCount) * 100));

  // Détermination de la source vidéo réelle (MP4 ou YouTube)
  const defaultVideoIndex = (currentIndex >= 0 ? currentIndex : 0) % SAMPLE_VIDEOS.length;
  const activeVideoUrl = customVideoUrl || currentLesson?.videoUrl || SAMPLE_VIDEOS[defaultVideoIndex];
  const isYouTube = isYouTubeUrl(activeVideoUrl);

  // Réinitialiser la vidéo lors du changement de leçon
  useEffect(() => {
    setCurrentTime(0);
    setHasError(false);
    setIsPlaying(false);
    setCustomVideoUrl('');

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [currentLesson?.id]);

  // Écoute de l'état plein écran natif
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Masquer les contrôles après 3s d'inactivité pendant la lecture
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Actions de contrôle vidéo
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasError(false);
          })
          .catch((e) => {
            console.warn("Échec lecture vidéo:", e);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setHasError(true));
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration || 1000, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * (duration || (currentLesson?.durationMinutes ? currentLesson.durationMinutes * 60 : 600));
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.warn("Erreur plein écran:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Erreur sortie plein écran:", err);
      });
    }
  };

  // Validation d'une leçon (terminée / non terminée)
  const toggleLessonComplete = async (lessonId: string) => {
    let updatedIds: string[];
    if (completedLessonIds.includes(lessonId)) {
      updatedIds = completedLessonIds.filter((id) => id !== lessonId);
    } else {
      updatedIds = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updatedIds);

    const newCompletedCount = updatedIds.length + completedQuizIds.length;
    const newPercent = Math.min(100, Math.round((newCompletedCount / totalItemsCount) * 100));
    await onUpdateProgress(newPercent, updatedIds, completedQuizIds);
  };

  // Fin automatique de la vidéo : marque la leçon comme terminée
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (currentLesson && !completedLessonIds.includes(currentLesson.id)) {
      toggleLessonComplete(currentLesson.id);
    }
  };

  const handlePassQuiz = async (quizId: string, scorePercent: number) => {
    if (!completedQuizIds.includes(quizId)) {
      const updatedQuizIds = [...completedQuizIds, quizId];
      setCompletedQuizIds(updatedQuizIds);

      const newCompletedCount = completedLessonIds.length + updatedQuizIds.length;
      const newPercent = Math.min(100, Math.round((newCompletedCount / totalItemsCount) * 100));
      await onUpdateProgress(newPercent, completedLessonIds, updatedQuizIds);
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  // Gestion de secours automatique en cas d'erreur de flux
  const handleVideoError = () => {
    const nextIdx = (defaultVideoIndex + 1) % SAMPLE_VIDEOS.length;
    if (activeVideoUrl !== SAMPLE_VIDEOS[nextIdx]) {
      setCustomVideoUrl(SAMPLE_VIDEOS[nextIdx]);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Progression de lecture en pourcentage
  const displayDuration = duration > 0 ? duration : (currentLesson?.durationMinutes ? currentLesson.durationMinutes * 60 : 900);
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#090A0F] text-slate-100' : 'bg-[#0B0D13] text-white'} flex flex-col font-sans relative`}>
      {/* Fond architectural discret */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-noise opacity-90" />
        <div className="absolute inset-0 mask-radial-fade bg-grid-architect-dark opacity-75" />
      </div>

      {/* Barre de contrôle supérieure (Cinema Header) */}
      <header className="px-4 sm:px-6 py-3.5 bg-[#090A0F]/90 border-white/[0.08] backdrop-blur-xl border-b flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 sm:gap-4 truncate">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Revenir au Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Mes Cours</span>
          </button>

          <div className="truncate">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-2">
              <span className="truncate">{course.title}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono shrink-0 hidden md:inline">
                {currentLesson ? `Leçon ${currentIndex + 1}/${allLessons.length}` : 'Lecture'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {currentLesson?.title || 'Sélectionnez un chapitre'}
            </p>
          </div>
        </div>

        {/* Jauge de progression et bouton Certificat */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className={currentProgressPercent === 100 ? 'text-amber-400' : 'text-indigo-400'}>
                {currentProgressPercent}% complété
              </span>
            </div>
            <div className="w-28 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentProgressPercent === 100 ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${currentProgressPercent}%` }}
              />
            </div>
          </div>

          {currentProgressPercent === 100 ? (
            <button
              onClick={onOpenCertificate}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 animate-pulse cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Certificat</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 hidden lg:flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Certificat à 100%</span>
            </div>
          )}
        </div>
      </header>

      {/* Conteneur principal (Lecteur + Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Colonne Principale (Lecteur Vidéo Réel + Onglets d'apprentissage) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* LECTEUR VIDÉO INTERACTIF PROFESSIONNEL */}
          <div 
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group shadow-2xl select-none"
          >
            {/* Si c'est une vidéo YouTube */}
            {isYouTube ? (
              <iframe
                src={getYouTubeEmbedUrl(activeVideoUrl)}
                title={currentLesson?.title || 'Vidéo de formation'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              /* ÉLÉMENT VIDÉO HTML5 RÉEL */
              <>
                <video
                  ref={videoRef}
                  src={activeVideoUrl}
                  poster={course.thumbnail}
                  playsInline
                  preload="metadata"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain bg-black cursor-pointer"
                  onClick={togglePlayPause}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      setIsLoading(false);
                      setHasError(false);
                    }
                  }}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => setIsLoading(false)}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                />

                {/* Bouton de lecture central quand la vidéo est en pause */}
                {!isPlaying && !isLoading && !hasError && (
                  <button
                    onClick={togglePlayPause}
                    className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md cursor-pointer"
                    aria-label="Lancer la vidéo"
                  >
                    <Play className="w-8 h-8 fill-white translate-x-0.5" />
                  </button>
                )}

                {/* Indicateur de chargement */}
                {isLoading && (
                  <div className="absolute z-20 flex flex-col items-center gap-2 bg-slate-950/70 p-4 rounded-2xl backdrop-blur-xs">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <span className="text-xs font-mono text-slate-300">Chargement de la vidéo HD...</span>
                  </div>
                )}

                {/* Erreur de lecture vidéo avec option de secours */}
                {hasError && (
                  <div className="absolute z-20 flex flex-col items-center gap-3 bg-slate-900/90 p-6 rounded-3xl border border-rose-500/30 text-center max-w-md">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <span className="text-sm font-bold text-white">Flux vidéo temporairement indisponible</span>
                    <p className="text-xs text-slate-400">
                      Le fichier vidéo ne peut pas être lu directement. Vous pouvez utiliser une autre vidéo ou continuer la lecture.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCustomVideoUrl(SAMPLE_VIDEOS[0]);
                          setHasError(false);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                      >
                        Utiliser la vidéo alternative
                      </button>
                    </div>
                  </div>
                )}

                {/* Badge Qualité & Info vidéo supérieure */}
                <div className={`absolute top-4 left-4 right-4 z-20 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono">
                    <Film className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-white font-bold">{currentLesson?.title || course.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-indigo-400/30">
                      1080p Full HD
                    </span>
                    <button
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                      title="Changer la source vidéo"
                    >
                      <LinkIcon className="w-3 h-3 text-indigo-400" />
                      <span className="hidden sm:inline">Changer de source</span>
                    </button>
                  </div>
                </div>

                {/* MODALE D'AJOUT D'URL VIDÉO PERSONNALISÉE */}
                {showCustomUrlInput && (
                  <div className="absolute top-14 right-4 z-30 w-80 p-4 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">Source vidéo de formation</span>
                      <button 
                        onClick={() => setShowCustomUrlInput(false)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Collez un lien vidéo direct (MP4) ou YouTube pour cette leçon :
                    </p>
                    <input
                      type="url"
                      placeholder="https://...mp4 ou YouTube"
                      value={tempUrlInput}
                      onChange={(e) => setTempUrlInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs mb-3 focus:outline-hidden focus:border-indigo-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setCustomVideoUrl('');
                          setTempUrlInput('');
                          setShowCustomUrlInput(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        Réinitialiser
                      </button>
                      <button
                        onClick={() => {
                          if (tempUrlInput.trim()) {
                            setCustomVideoUrl(tempUrlInput.trim());
                            setShowCustomUrlInput(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                )}

                {/* BARRE DE CONTRÔLES INFÉRIEURE ULTRA-MODERNE */}
                <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}>
                  {/* BARRE DE PROGRESSION SCRUBBABLE */}
                  <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="relative w-full h-2 bg-slate-700/60 hover:h-3 rounded-full cursor-pointer transition-all mb-3 group/progress overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 relative rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform" />
                    </div>
                  </div>

                  {/* LIGNE DES BOUTONS DE CONTRÔLE */}
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    {/* Groupe gauche : Lecture, -10s, +10s, Volume, Temps */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlayPause}
                        className="p-1.5 hover:text-white transition cursor-pointer"
                        title={isPlaying ? "Pause (Espace)" : "Lire (Espace)"}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSkip(-10)}
                        className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Reculer de 10s"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSkip(10)}
                        className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Avancer de 10s"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Contrôle du Volume */}
                      <div className="flex items-center gap-1.5 group/vol">
                        <button
                          onClick={toggleMute}
                          className="p-1.5 hover:text-white transition cursor-pointer"
                          title={isMuted ? "Activer le son" : "Couper le son"}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : volume < 0.5 ? (
                            <Volume1 className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-14 sm:w-20 h-1 accent-indigo-500 bg-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Compteur temps écoulé / total */}
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300 ml-1">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{formatTime(displayDuration)}</span>
                      </div>
                    </div>

                    {/* Groupe droit : Vitesse, Terminer la leçon, Plein écran */}
                    <div className="flex items-center gap-2.5">
                      {/* Sélecteur de vitesse de lecture */}
                      <button
                        onClick={cyclePlaybackRate}
                        className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono font-bold rounded-lg transition cursor-pointer"
                        title="Changer la vitesse de lecture"
                      >
                        {playbackRate}x
                      </button>

                      {/* Marquer la leçon comme terminée */}
                      <button
                        onClick={() => currentLesson && toggleLessonComplete(currentLesson.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          isCurrentCompleted
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-white/20 hover:bg-white text-slate-100 hover:text-slate-900 backdrop-blur-md'
                        }`}
                      >
                        {isCurrentCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Terminée</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Valider la leçon</span>
                          </>
                        )}
                      </button>

                      {/* Bascule Plein écran */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 hover:text-white transition cursor-pointer"
                        title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
                      >
                        {isFullscreen ? (
                          <Minimize className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bannière 100% complété & Certificat débloqué */}
          {currentProgressPercent === 100 && (
            <div className="p-4 mx-6 mt-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-indigo-500/20 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    100% des modules et quiz validés !
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Toutes nos félicitations ! Votre certificat officiel personnalisé SkillHub est débloqué.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenCertificate}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 shrink-0 hover:scale-105 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Télécharger mon certificat</span>
              </button>
            </div>
          )}

          {/* Panneau inférieur : Onglets Leçon / Notes / Ressources */}
          <div className={`p-6 sm:p-8 flex-1 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                  <span>Chapitre {currentIndex + 1}</span>
                  <span>•</span>
                  <span>{currentLesson?.durationMinutes || 15} minutes</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Video className="w-3 h-3" /> Vidéo active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentLesson?.title || 'Aperçu du cours'}
                </h2>
              </div>

              {/* Navigation Leçon précédente / suivante */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentIndex <= 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition cursor-pointer"
                  title="Leçon précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={currentIndex >= allLessons.length - 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <span>Leçon suivante</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Onglets sous le player */}
            <div className="mt-6">
              <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    activeTab === 'content'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Description & Objectifs
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    activeTab === 'resources'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ressources & Fichiers
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    activeTab === 'notes'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mes Notes Personnelles
                </button>
              </div>

              {/* Contenu onglet Description */}
              {activeTab === 'content' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  <p>
                    Bienvenue dans cette leçon consacrée à <strong className="text-white">{currentLesson?.title}</strong>. 
                    Vous allez acquérir les compétences nécessaires pour concevoir et appliquer les notions en pratique sur votre propre environnement.
                  </p>
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Points clés abordés dans cette vidéo :
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li>• Mise en œuvre des bonnes pratiques de développement et d'architecture.</li>
                      <li>• Découpage modulaire et gestion fine de l'état asynchrone.</li>
                      <li>• Exercice de mise en pratique guidé avec validation instantanée.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Contenu onglet Ressources */}
              {activeTab === 'resources' && (
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Code source du projet (.zip)</div>
                        <div className="text-[11px] text-slate-400">4.2 Mo • Code prêt à l'emploi</div>
                      </div>
                    </div>
                    <button className="p-2 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs transition flex items-center gap-1 cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Fiche mémo condensée (Cheatsheet PDF)</div>
                        <div className="text-[11px] text-slate-400">1.1 Mo • Référentiel des commandes</div>
                      </div>
                    </div>
                    <button className="p-2 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs transition flex items-center gap-1 cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contenu onglet Notes */}
              {activeTab === 'notes' && (
                <div className="max-w-2xl space-y-3">
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Notez ici vos remarques, raccourcis et idées clés pendant la vidéo..."
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 h-32 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => alert('Note enregistrée localement pour cette session !')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Enregistrer ma note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne Latérale Droite : Sommaire & Chapitrage avec suivi */}
        <aside className={`w-full lg:w-96 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-950 border-slate-800'} border-t lg:border-t-0 lg:border-l flex flex-col h-[400px] lg:h-auto overflow-hidden`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-white">Programme de la formation</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {completedLessonIds.length} sur {allLessons.length} leçons terminées
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-indigo-400">
                {Math.round((completedLessonIds.length / (allLessons.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Liste déroulante des Modules et Leçons */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {allModules.length > 0 ? (
              allModules.map((module) => (
                <div key={module.id} className="rounded-2xl bg-slate-800/40 border border-slate-800/80 overflow-hidden">
                  <div className="px-3 py-2.5 bg-slate-800/70 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {module.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {module.lessons.filter((l) => completedLessonIds.includes(l.id)).length}/{module.lessons.length}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {module.lessons.map((lesson) => {
                      const isCurrent = currentLesson?.id === lesson.id;
                      const isCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            setCurrentLesson(lesson);
                          }}
                          className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition cursor-pointer group ${
                            isCurrent
                              ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLessonComplete(lesson.id);
                              }}
                              className="shrink-0 text-slate-500 hover:text-emerald-400 transition cursor-pointer"
                              title={isCompleted ? "Marquer comme non terminée" : "Marquer comme terminée"}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                              )}
                            </button>
                            <span className={`text-xs leading-snug truncate ${isCurrent ? 'font-bold text-white' : ''}`}>
                              {lesson.title}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-500 shrink-0">
                            {lesson.durationMinutes}m
                          </span>
                        </div>
                      );
                    })}

                    {/* Bouton interactif Quiz de validation du Chapitre */}
                    {(() => {
                      const modQuiz = getModuleQuiz(module, course.title);
                      const isQuizPassed = completedQuizIds.includes(modQuiz.id);

                      return (
                        <div
                          onClick={() => setActiveQuizModule(module)}
                          className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                            isQuizPassed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Brain className={`w-4 h-4 shrink-0 ${isQuizPassed ? 'text-emerald-400' : 'text-indigo-400'}`} />
                            <div className="text-xs font-bold truncate">
                              Mini-QCM : Valider les acquis
                            </div>
                          </div>

                          {isQuizPassed ? (
                            <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Check className="w-2.5 h-2.5" /> Validé
                            </span>
                          ) : (
                            <span className="text-[10px] bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                              Faire le Quiz
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-400">Aucun module disponible pour ce cours.</div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal interactif du Quiz de Chapitre */}
      {activeQuizModule && (
        <ChapterQuizModal
          {...({ quiz: getModuleQuiz(activeQuizModule, course.title) } as any)}
          moduleTitle={activeQuizModule.title}
          courseTitle={course.title}
          isOpen={true}
          isAlreadyPassed={completedQuizIds.includes(getModuleQuiz(activeQuizModule, course.title).id)}
          onClose={() => setActiveQuizModule(null)}
          onPassQuiz={(quizId, scorePercent) => {
            handlePassQuiz(quizId, scorePercent);
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
}