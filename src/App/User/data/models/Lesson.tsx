import firestore from '@react-native-firebase/firestore';
export interface Lesson {
  id: string;
  courseId: string;
  step: number;
  stepTitle: string;
  overview: string;
  totalUnits: number;
  completedUnits: number;
  units: UnitItem[];
}

export interface UnitItem {
  unitTitle: string;
  progress: string;
  subLessons: SubLesson[];
}

export interface SubLesson {
  id: string;
  title: string;
  type: string;
  isCompleted: boolean;
}