import firestore from '@react-native-firebase/firestore';
export interface PrivateChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderImageUrl: string;
  content: string;
  timestamp: Timestamp | null;
  read: boolean;
}