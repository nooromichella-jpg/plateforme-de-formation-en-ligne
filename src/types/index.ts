/**
 * Types TypeScript pour la plateforme de formation en ligne SkillHub.
 * Définit les modèles de données pour les cours, les inscriptions, les avis et le chat d'assistance IA.
 */

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all-levels';

export type CourseCategory = 
  | 'development'
  | 'ai-data'
  | 'design'
  | 'business'
  | 'marketing'
  | 'devops';

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  company?: string;
  studentsCount?: number;
  coursesCount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl?: string;
  description?: string;
  isPreview?: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ChapterQuiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore?: number; // e.g. 70 (%) or 2 out of 3
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: ChapterQuiz;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  instructor: Instructor;
  thumbnail: string;
  category: CourseCategory;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  isFree?: boolean;
  durationMinutes: number;
  lessonsCount: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  learningOutcomes: string[];
  prerequisites?: string[];
  language: string;
  badge?: 'bestseller' | 'nouveau' | 'populaire';
  publishedAt: string;
  updatedAt?: string;
  modules?: CourseModule[];
}

export type EnrollmentStatus = 'active' | 'completed' | 'paused';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  progress: number; // 0 à 100 (%)
  completedLessonIds: string[];
  completedQuizIds?: string[];
  lastAccessedAt: string;
  certificateIssued?: boolean;
  userEmail?: string;
  userDisplayName?: string;
  studentName?: string;
  courseSnapshot: {
    title: string;
    thumbnail: string;
    category: CourseCategory;
    price: number;
    durationMinutes: number;
    instructorName: string;
    level: CourseLevel;
  };
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'code' | 'document';
  url: string;
  size?: string;
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  relatedCourseIds?: string[];
  isError?: boolean;
  attachments?: ChatAttachment[];
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
