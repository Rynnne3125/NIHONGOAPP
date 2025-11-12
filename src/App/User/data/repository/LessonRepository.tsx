
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
  Lesson
} from '../models';

const db = firestore();
export class LessonRepository {
  async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    try {
      const q = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
        orderBy('step')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => doc.data() as Lesson);
    } catch (error) {
      console.error('Error getting lessons:', error);
      return [];
    }
  }

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
      return lessonDoc.exists() ? lessonDoc.data() as Lesson : null;
    } catch (error) {
      console.error('Error getting lesson by ID:', error);
      return null;
    }
  }
}