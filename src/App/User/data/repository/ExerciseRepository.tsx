
import firestore, { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query, 
  where,
  orderBy,
  serverTimestamp,
  FieldValue,
} from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';
import { 
  Exercise
} from '../models';

const db = firestore();
export class ExerciseRepository {
  async getExercisesBySubLessonId(subLessonId: string, lessonId: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, 'lessons', lessonId, 'exercises'),
        where('subLessonId', '==', subLessonId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Exercise);
    } catch (error) {
      console.error('Error getting exercises:', error);
      return [];
    }
  }

  async getPracticeExercisesExcludingFirstSubLesson(lessonId: string): Promise<Exercise[]> {
    try {
      console.log('Getting practice exercises for lessonId:', lessonId);

      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
      const lesson = lessonDoc.data() as Lesson;

      if (!lesson) return [];

      console.log('Found', lesson.units.length, 'units for lessonId:', lessonId);

      const filteredSubLessonIds = lesson.units
        .flatMap(unit => unit.subLessons)
        .filter(subLesson => !subLesson.id.endsWith('-1'))
        .map(subLesson => subLesson.id);

      console.log('Filtered subLessonIds:', filteredSubLessonIds);

      const exercisesSnapshot = await getDocs(
        collection(db, 'lessons', lessonId, 'exercises')
      );

      console.log('Found', exercisesSnapshot.docs.length, 'exercises in total');

      const exercises = exercisesSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Exercise))
        .filter(exercise => {
          const isIncluded = filteredSubLessonIds.includes(exercise.subLessonId || '');
          console.log('Exercise:', exercise.id, 'subLessonId:', exercise.subLessonId, 'included:', isIncluded);
          return isIncluded;
        });

      console.log('Returning', exercises.length, 'filtered exercises');
      return exercises;
    } catch (error) {
      console.error('Error getting practice exercises:', error);
      return [];
    }
  }
}
