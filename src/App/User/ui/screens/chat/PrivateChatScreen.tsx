import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { User, PrivateChatMessage } from '../types';
import { UserRepository } from '../repositories/UserRepository';
import BottomNavigationBar from '../components/BottomNavigationBar';

interface PrivateChatScreenProps {
  userEmail: string;
  userRepository: UserRepository;
}

const PrivateChatScreen: React.FC<PrivateChatScreenProps> = ({
  userEmail,
  userRepository,
}) => {
  const navigate = useNavigate();
  const { partnerUserId } = useParams<{ partnerUserId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partnerUser, setPartnerUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [indexError, setIndexError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create chatId from two user IDs (sorted for consistency)
  const chatId = useMemo(() => {
    if (!currentUser?.id || !partnerUserId) return '';
    const ids = [currentUser.id, partnerUserId].sort();
    return ids.join('_');
  }, [currentUser?.id, partnerUserId]);

  // Load current user and partner user
  useEffect(() => {
    const loadUsers = async () => {
      if (!partnerUserId) return;

      try {
        // Load current user
        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);
        console.log('Current user:', user?.username);

        // Load partner user
        const partner = await userRepository.getUserById(partnerUserId);
        setPartnerUser(partner);
        console.log('Partner user:', partner?.username);

        // Load initial messages
        if (chatId) {
          try {
            const messagesSnapshot = await getDocs(
              query(
                collection(firestore, 'privateMessages'),
                where('chatId', '==', chatId)
              )
            );

            const loadedMessages = messagesSnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .sort((a: any, b: any) => {
                const aTime = a.timestamp?.seconds || 0;
                const bTime = b.timestamp?.seconds || 0;
                return aTime - bTime;
              }) as PrivateChatMessage[];

            setMessages(loadedMessages);
            console.log('Loaded', loadedMessages.length, 'messages initially');
          } catch (error: any) {
            console.error('Error loading initial messages:', error);
            if (
              error.message?.includes('FAILED_PRECONDITION') &&
              error.message?.includes('index')
            ) {
              setIndexError(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [userEmail, partnerUserId, chatId, userRepository]);

  // Setup real-time listener for messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(firestore, 'privateMessages'),
      where('chatId', '==', chatId)
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
          }) as PrivateChatMessage[];

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
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !chatId || !partnerUserId)
      return;

    const sentText = messageText;
    setMessageText('');

    try {
      // Create new message
      const newMessage: Omit<PrivateChatMessage, 'id'> = {
        chatId,
        senderId: currentUser.id,
        receiverId: partnerUserId,
        senderName: currentUser.username,
        senderImageUrl: currentUser.imageUrl,
        content: sentText,
        timestamp: Timestamp.now(),
      };

      // Add message to Firestore
      const docRef = await addDoc(
        collection(firestore, 'privateMessages'),
        newMessage
      );

      console.log('Message added with ID:', docRef.id);

      // Add activity points
      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 1,
      };
      await userRepository.updateUser(updatedUser);

      // Send notification to partner
      if (partnerUser) {
        try {
          const notificationTitle = `Tin nhắn mới từ ${currentUser.username}`;
          const notificationMessage = sentText;

          // Save notification
          await addDoc(collection(firestore, 'notifications'), {
            userId: partnerUserId,
            title: notificationTitle,
            message: notificationMessage,
            timestamp: serverTimestamp(),
            read: false,
            type: 'private_message',
            referenceId: docRef.id,
            senderId: currentUser.id,
          });

          console.log('Notification sent to:', partnerUser.username);
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
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
          {partnerUser && (
            <div className="flex items-center space-x-3">
              <img
                src={partnerUser.imageUrl || '/default-avatar.png'}
                alt={partnerUser.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-bold">{partnerUser.username}</h1>
                <p
                  className={`text-xs ${
                    partnerUser.online ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {partnerUser.online ? 'Đang hoạt động' : 'Không hoạt động'}
                </p>
              </div>
            </div>
          )}
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

export default PrivateChatScreen;