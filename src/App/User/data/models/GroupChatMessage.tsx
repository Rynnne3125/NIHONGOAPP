import firestore from '@react-native-firebase/firestore';
export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderImageUrl: string;
  content: string;
  timestamp: Timestamp | null;
}