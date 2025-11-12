import { Timestamp } from 'firebase/firestore';
export interface Course {
  id: string;
  title: string;
  description: string;
  rating: number;
  reviews: number;
  likes: number;
  dislikes: number;
  imageRes: string;
  vip: boolean;
}