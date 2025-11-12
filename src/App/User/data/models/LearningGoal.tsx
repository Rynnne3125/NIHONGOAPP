import firestore from '@react-native-firebase/firestore';
export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: string;
  startDate: number;
  endDate: number;
}