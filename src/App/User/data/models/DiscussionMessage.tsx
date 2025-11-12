import { Timestamp } from 'firebase/firestore';
export interface DiscussionMessage {
  id: string;
  discussionId: string;
  senderId: string;
  senderName: string;
  senderImageUrl: string;
  content: string;
  timestamp: Timestamp | null;
  attachmentUrl?: string | null;
}