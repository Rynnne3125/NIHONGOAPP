
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where,
  orderBy,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { 
  User, 
  Course, 
  CourseReview, 
  Lesson, 
  Exercise, 
  Flashcard, 
  UserProgress,
  calculateRank 
} from './types';

const db = getFirestore();
export class FlashcardRepository {
  async getFlashcardsByLessonId(lessonId: string): Promise<Flashcard[]> {
    try {
      const q = query(
        collection(db, 'flashcards'),
        where('lessonId', '==', lessonId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Flashcard);
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return [];
    }
  }

  async getFlashcardById(flashcardId: string): Promise<Flashcard | null> {
    try {
      const flashcardDoc = await getDoc(doc(db, 'flashcards', flashcardId));
      return flashcardDoc.exists() ? flashcardDoc.data() as Flashcard : null;
    } catch (error) {
      console.error('Error getting flashcard by ID:', error);
      return null;
    }
  }

  async addFlashcard(flashcard: Flashcard): Promise<void> {
    try {
      const flashcardId = flashcard.id || doc(collection(db, 'flashcards')).id;
      await setDoc(doc(db, 'flashcards', flashcardId), flashcard);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  }
}