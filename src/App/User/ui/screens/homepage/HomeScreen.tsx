import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  imageUrl: string;
  vip: boolean;
  rank: string;
  jlptLevel: number | null;
  activityPoints: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageRes: string;
  rating: number;
  likes: number;
  reviews: number;
}

interface UserProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: string[];
  totalLessons: number;
}

const HomeScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    // Mock data
    setUser({
      id: '1',
      username: 'Học viên',
      email: 'user@example.com',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      vip: false,
      rank: 'Beginner',
      jlptLevel: 5,
      activityPoints: 350
    });

    setCourses([
      {
        id: '1',
        title: 'Hiragana Cơ Bản',
        description: 'Học bảng chữ cái Hiragana',
        imageRes: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
        rating: 4.5,
        likes: 120,
        reviews: 45
      },
      {
        id: '2',
        title: 'Katakana Nâng Cao',
        description: 'Thành thạo Katakana',
        imageRes: 'https://images.unsplash.com/photo-1604935040313-3f552d155e90?w=400',
        rating: 4.8,
        likes: 200,
        reviews: 80
      }
    ]);

    setUserProgress([
      {
        courseId: '1',
        courseTitle: 'Hiragana Cơ Bản',
        progress: 0.65,
        completedLessons: ['1', '2', '3'],
        totalLessons: 10
      }
    ]);
  }, []);

  const totalLessons = userProgress.reduce((sum, p) => sum + p.totalLessons, 0);
  const completedLessons = userProgress.reduce((sum, p) => sum + p.completedLessons.length, 0);
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">👋 こんにちわ {user?.username} さん</h1>
            {user?.vip && (
              <p className="text-sm text-yellow-600">⭐ VIP です!</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">👥</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">👤</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.imageUrl}
              alt="User"
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.username}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{user?.rank}</span>
                {user?.vip && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-semibold">
                    VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{user?.activityPoints || 0}</div>
              <div className="text-xs text-gray-600">Điểm năng động</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userProgress.length}</div>
              <div className="text-xs text-gray-600">Khóa học</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">N{user?.jlptLevel || 'A'}</div>
              <div className="text-xs text-gray-600">JLPT Level</div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Tiến độ học tập</span>
              <span className="text-green-600 font-bold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{completedLessons}/{totalLessons} bài học</span>
              <span>Cập nhật: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Your Progress */}
        {userProgress.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tiến độ của bạn</h2>
            <div className="space-y-3">
              {userProgress.map(progress => {
                const course = courses.find(c => c.id === progress.courseId);
                return (
                  <div key={progress.courseId} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={course?.imageRes}
                        alt={progress.courseTitle}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold">{progress.courseTitle}</h3>
                        <p className="text-sm text-gray-600">
                          {progress.completedLessons.length}/{progress.totalLessons} lessons
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(progress.progress * 100)}%
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full font-medium hover:shadow-lg transition-shadow">
                      Continue
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learning Tools */}
        <div>
          <h2 className="text-xl font-bold mb-4">Công cụ học tập</h2>
          <div className="grid grid-cols-2 gap-4">
            <LearningToolCard title="Flashcards" icon="📇" color="bg-red-500" />
            <LearningToolCard title="Bảng xếp hạng" icon="🏆" color="bg-blue-500" />
            <LearningToolCard title="Cộng đồng" icon="👥" color="bg-purple-500" />
            <LearningToolCard title="Luyện tập" icon="💪" color="bg-orange-500" />
          </div>
        </div>

        {/* All Courses */}
        <div>
          <h2 className="text-xl font-bold mb-4">Tất cả khóa học</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {courses.map(course => (
              <div key={course.id} className="min-w-[220px] bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={course.imageRes}
                  alt={course.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>⭐ {course.rating}</span>
                    <span>👍 {course.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const LearningToolCard: React.FC<{ title: string; icon: string; color: string }> = ({ title, icon, color }) => {
  return (
    <div className={`${color} rounded-xl p-6 text-white cursor-pointer hover:shadow-xl transition-shadow`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold">{title}</div>
    </div>
  );
};

export default HomeScreen;