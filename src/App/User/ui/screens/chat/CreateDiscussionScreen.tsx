import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { User, Discussion } from '../types';
import { UserRepository } from '../repositories/UserRepository';
import BottomNavigationBar from '../components/BottomNavigationBar';

interface CreateDiscussionScreenProps {
  userEmail: string;
  userRepository: UserRepository;
}

const CreateDiscussionScreen: React.FC<CreateDiscussionScreenProps> = ({
  userEmail,
  userRepository,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);
        console.log('Loaded current user:', user?.username);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadUser();
  }, [userEmail, userRepository]);

  const handleCreateDiscussion = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!currentUser) {
      alert('Không thể xác định người dùng hiện tại');
      return;
    }

    setIsLoading(true);

    try {
      // Parse tags
      const tagList = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create new discussion
      const newDiscussion: Omit<Discussion, 'id'> = {
        title,
        content,
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorImageUrl: currentUser.imageUrl,
        commentCount: 0,
        createdAt: Date.now(),
        tags: tagList,
      };

      // Save to Firestore
      const docRef = await addDoc(
        collection(firestore, 'discussions'),
        newDiscussion
      );

      console.log('Discussion created with ID:', docRef.id);

      // Add activity points to user
      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 5,
      };
      await userRepository.updateUser(updatedUser);

      // Show success message
      alert('Đã tạo thảo luận mới');

      // Navigate to discussion chat
      navigate(`/discussion-chat/${docRef.id}/${userEmail}`);
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleNavigate = (route: string) => {
    navigate(`/${route}/${userEmail}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
          <h1 className="text-xl font-bold">Tạo thảo luận mới</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung"
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ví dụ: học tập, ngữ pháp, kanji"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreateDiscussion}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
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
                <span>Đăng thảo luận</span>
              </>
            )}
          </button>
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

export default CreateDiscussionScreen;