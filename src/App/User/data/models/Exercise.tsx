import { Timestamp } from 'firebase/firestore';
export enum ExerciseType {
  FLASHCARD = 'FLASHCARD',
  MEMORY_GAME = 'MEMORY_GAME',
  VIDEO = 'VIDEO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  DRAG_MATCH = 'DRAG_MATCH',
  LISTEN_CHOOSE = 'LISTEN_CHOOSE',
  LISTEN_WRITE = 'LISTEN_WRITE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  HANDWRITING = 'HANDWRITING',
  MIXED = 'MIXED',
  PRACTICE = 'PRACTICE'
}

export const exerciseTypeFromString = (type: string): ExerciseType | null => {
  const upperType = type.toUpperCase();
  return Object.values(ExerciseType).includes(upperType as ExerciseType)
    ? (upperType as ExerciseType)
    : null;
};

export interface Exercise {
  id?: string | null;
  subLessonId?: string | null;
  question?: string | null;
  answer?: string | null;
  type?: ExerciseType | null;
  options?: string[] | null;
  videoUrl?: string | null;
  romanji?: string | null;
  kana?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  title?: string | null;
  passed: boolean;
  explanation?: string | null;
}
