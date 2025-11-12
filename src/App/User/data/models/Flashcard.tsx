import firestore from '@react-native-firebase/firestore';
export interface Flashcard {
  id: string;
  exerciseId: string;
  term: string;
  definition: string;
  example?: string | null;
  pronunciation?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
}