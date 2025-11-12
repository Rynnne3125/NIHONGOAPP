
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
  Flashcard
} from '../models';

const db = firestore();
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

  async getAllFlashcards(): Promise<Flashcard[]> {
    try {
      const snapshot = await getDocs(collection(db, 'flashcards'));
      return snapshot.docs.map(doc => doc.data() as Flashcard);
    } catch (error) {
      console.error('Error getting all flashcards:', error);
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