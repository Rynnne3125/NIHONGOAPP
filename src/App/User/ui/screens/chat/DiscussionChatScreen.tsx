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
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { User, Discussion, DiscussionMessage } from '../types';
import { UserRepository } from '../repositories/UserRepository';
import BottomNavigationBar from '../components/BottomNavigationBar';

interface DiscussionChatScreenProps {
  userEmail: string;
  userRepository: UserRepository;
}

const DiscussionChatScreen: React.FC<DiscussionChatScreenProps> = ({
  userEmail,
  userRepository,
}) => {
  const navigate = useNavigate();
  const { discussionId } = useParams<{ discussionId: string }>();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [indexError, setIndexError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load discussion and current user
  useEffect(() => {
    const loadData = async () => {
      if (!discussionId) return;

      try {
        // Load discussion
        const discussionDoc = await getDoc(
          doc(firestore, 'discussions', discussionId)
        );
        if (discussionDoc.exists()) {
          setDiscussion({
            id: discussionDoc.id,
            ...discussionDoc.data(),
          } as Discussion);
          console.log('Loaded discussion:', discussionDoc.data());
        }

        // Load current user
        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);
        console.log('Current user:', user?.username);

        // Load initial messages without orderBy
        const messagesSnapshot = await getDocs(
          query(
            collection(firestore, 'discussionMessages'),
            where('discussionId', '==', discussionId)
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
          }) as DiscussionMessage[];

        setMessages(loadedMessages);
        console.log('Loaded', loadedMessages.length, 'messages initially');
      } catch (error: any) {
        console.error('Error loading discussion or user:', error);
        if (
          error.message?.includes('FAILED_PRECONDITION') &&
          error.message?.includes('index')
        ) {
          setIndexError(true);
        }
      }
    };

    loadData();
  }, [discussionId, userEmail, userRepository]);

  // Setup real-time listener for messages
  useEffect(() => {
    if (!discussionId) return;

    const q = query(
      collection(firestore, 'discussionMessages'),
      where('discussionId', '==', discussionId)
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
          }) as DiscussionMessage[];

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
  }, [discussionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !discussion || !discussionId)
      return;

    const sentText = messageText;
    setMessageText('');

    try {
      // Create new message
      const newMessage: Omit<DiscussionMessage, 'id'> = {
        discussionId,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderImageUrl: currentUser.imageUrl,
        content: sentText,
        timestamp: Timestamp.now(),
      };

      // Add message to Firestore
      const docRef = await addDoc(
        collection(firestore, 'discussionMessages'),
        newMessage
      );

      console.log('Message added with ID:', docRef.id);

      // Update comment count
      await updateDoc(doc(firestore, 'discussions', discussionId), {
        commentCount: (discussion.commentCount || 0) + 1,
      });

      // Add activity points
      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 2,
      };
      await userRepository.updateUser(updatedUser);
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
            {discussion?.title || 'Thảo luận'}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Index Error Warning */}
        {indexError && (
          <div className="bg-red-50 border-b border-red-200 p-3 text-center">
            <p className="text-sm text-red-700">
              Cần tạo chỉ mục trong Firebase. Vui lòng liên hệ admin.
            </p>
          </div>
        )}

        {/* Discussion Header */}
        {discussion && (
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex items-start space-x-3">
              <img
                src={discussion.authorImageUrl || '/default-avatar.png'}
                alt={discussion.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-bold text-sm">{discussion.authorName}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(discussion.createdAt)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm">{discussion.content}</p>
            {discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {discussion.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-cyan-50 text-cyan-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-xs ${
                    isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <img
                    src={message.senderImageUrl || '/default-avatar.png'}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    {!isCurrentUser && (
                      <p className="text-xs text-gray-500 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-green-600 text-white rounded-tr-sm'
                          : 'bg-gray-200 text-black rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="bg-white border-t p-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition"
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

export default DiscussionChatScreen;