import firestore from '@react-native-firebase/firestore';
export interface StudyGroup {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creatorId: string;
  createdBy: string;
  createdAt: number;
  lastActivity: Timestamp | null;
  members: string[];
  memberCount: number;
}