import { Timestamp } from 'firebase/firestore';
export interface UserProgress {
  id?: string | null;
  userId: string;
  courseId: string;
  courseTitle: string;
  completedLessons: string[];
  completedExercises: string[];
  passedExercises: string[];
  completedSubLessons: string[];
  currentLessonId?: string | null;
  totalLessons: number;
  totalExercises: number;
  progress: number;
  lastUpdated: number;
}