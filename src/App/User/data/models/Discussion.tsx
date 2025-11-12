import firestore from '@react-native-firebase/firestore';
export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string;
  createdAt: number;
  tags: string[];
  commentCount: number;
}

