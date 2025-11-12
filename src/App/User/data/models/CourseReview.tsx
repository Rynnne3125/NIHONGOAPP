import { Timestamp } from 'firebase/firestore';
export interface CourseReview {
  id: string;
  userId: string;
  courseId: string;
  text: string;
  rating: number;
  timestamp: number;
  userName: string;
  userAvatar: string;
}
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN');
};