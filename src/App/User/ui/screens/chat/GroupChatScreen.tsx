import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  Timestamp,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { User, StudyGroup, GroupChatMessage } from '../types';
import { UserRepository } from '../repositories/UserRepository';
import BottomNavigationBar from '../components/BottomNavigationBar';

interface GroupChatScreenProps {
  userEmail: string;
  userRepository: UserRepository;
}

const GroupChatScreen: React.FC<GroupChatScreenProps> = ({
  userEmail,
  userRepository,
}) => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [indexError, setIndexError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load group and current user
  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;

      try {
        // Load study group
        const groupDoc = await getDoc(doc(firestore, 'studyGroups', groupId));
        if (groupDoc.exists()) {
          setStudyGroup({
            id: groupDoc.id,
            ...groupDoc.data(),
          } as StudyGroup);
          console.log('Loaded study group:', groupDoc.data());
        }

        // Load current user
        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);
        console.log('Current user:', user?.username);

        // Load initial messages without orderBy
        const messagesSnapshot = await getDocs(
          query(
            collection(firestore, 'groupMessages'),
            where('groupId', '==', groupId)
          )
        );

        const initialMessages = messagesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a: any, b: any) => {
            const aTime = a.timestamp?.seconds || 0;
            const bTime = b.timestamp?.seconds || 0;
            return aTime - bTime;
          }) as GroupChatMessage[];

        console.log('Loaded', initialMessages.length, 'initial messages');
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadData();
  }, [groupId, userEmail, userRepository]);

  // Setup real-time listener for messages
  useEffect(() => {
    if (!groupId) return;

    const q = query(
      collection(firestore, 'groupMessages'),
      where('groupId', '==', groupId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a: any, b: any) => {
            const aTime = a.timestamp?.seconds || 0;
            const bTime = b.timestamp?.seconds || 0;
            return aTime - bTime;
          }) as GroupChatMessage[];

        console.log('Received', newMessages.length, 'messages in real-time');
        setMessages(newMessages);
      },
      (error: any) => {
        console.error('Listen failed:', error);
        if (
          error.message?.includes('FAILED_PRECONDITION') &&
          error.message?.includes('index')
        ) {
          setIndexError(true);
          alert('Cần tạo chỉ mục trong Firebase. Vui lòng liên hệ admin.');
        }
      }
    );

    return () => {
      console.log('Removing Firestore listener');
      unsubscribe();
    };
  }, [groupId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !studyGroup || !groupId) return;

    const sentText = messageText;
    setMessageText('');

    try {
      // Create new message
      const newMessage: Omit<GroupChatMessage, 'id'> = {
        groupId,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderImageUrl: currentUser.imageUrl,
        content: sentText,
        timestamp: Timestamp.now(),
      };

      // Add message to Firestore
      const docRef = await addDoc(
        collection(firestore, 'groupMessages'),
        newMessage
      );

      console.log('Message added with ID:', docRef.id);

      // Update group last activity
      await updateDoc(doc(firestore, 'studyGroups', groupId), {
        lastActivity: Timestamp.now(),
      });

      // Add activity points
      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 2,
      };
      await userRepository.updateUser(updatedUser);

      // Send notifications to other users
      try {
        const notificationTitle = `Tin nhắn mới trong ${studyGroup.title}`;
        const notificationMessage = `${currentUser.username}: ${sentText}`;

        // Get all users except sender
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const otherUsers = usersSnapshot.docs
          .filter((doc) => doc.id !== currentUser.id)
          .map((doc) => doc.id);

        // Save notification for each user
        for (const userId of otherUsers) {
          await addDoc(collection(firestore, 'notifications'), {
            userId,
            title: notificationTitle,
            message: notificationMessage,
            timestamp: serverTimestamp(),
            read: false,
            type: 'group_message',
            referenceId: groupId,
            senderId: currentUser.id,
          });
        }
      } catch (error) {
        console.error('Failed to send notifications:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Lỗi gửi tin nhắn: ${error instanceof Error ? error.message : 'Unknown'}`);
      setMessageText(sentText);
    }
  };

  const formatTime = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNavigate = (route: string) => {
    navigate(`/${route}/${userEmail}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {studyGroup?.title || 'Nhóm học tập'}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Index Error Warning */}
        {indexError && (
          <div className="bg-amber-50 border-b border-amber-200 p-4">
            <h3 className="font-bold text-sm mb-2">Cần cấu hình Firebase</h3>
            <p className="text-xs text-gray-700">
              Ứng dụng cần tạo chỉ mục trong Firebase để hiển thị tin nhắn theo
              thời gian. Vui lòng liên hệ admin hoặc tạo chỉ mục trong Firebase
              Console.
            </p>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser?.id;
            return (
              <div key={message.id} className="space-y-1">
                {!isCurrentUser && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={message.senderImageUrl || '/default-avatar.png'}
                      alt={message.senderName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-500">
                      {message.senderName}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-end space-x-2 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isCurrentUser && <div className="w-7" />}
                  {isCurrentUser && (
                    <span className="text-xs text-gray-400 mb-1">
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs ${
                      isCurrentUser
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-gray-200 text-black rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {!isCurrentUser && (
                    <span className="text-xs text-gray-400 mb-1">
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="bg-white border-t p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition flex-shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigationBar
        selectedItem="community"
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default GroupChatScreen;