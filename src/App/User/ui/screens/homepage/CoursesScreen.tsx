import React, { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  imageRes: string;
  vip: boolean;
  rating: number;
  likes: number;
  reviews: number;
  dislikes?: number;
}

interface UserProgress {
  courseId: string;
  progress: number;
  completedLessons: string[];
  totalLessons: number;
}

const CoursesScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  const tabs = ['Tất cả khóa học', 'Khóa học của tôi', 'Khóa học VIP'];

  useEffect(() => {
    // Mock data
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Hiragana Cơ Bản',
        description: 'Học bảng chữ cái Hiragana từ đầu',
        imageRes: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
        vip: false,
        rating: 4.5,
        likes: 120,
        reviews: 45,
        dislikes: 5
      },
      {
        id: '2',
        title: 'Katakana Nâng Cao',
        description: 'Thành thạo bảng chữ Katakana',
        imageRes: 'https://images.unsplash.com/photo-1604935040313-3f552d155e90?w=400',
        vip: true,
        rating: 4.8,
        likes: 200,
        reviews: 80,
        dislikes: 3
      },
      {
        id: '3',
        title: 'JLPT N5 Toàn Diện',
        description: 'Chuẩn bị cho kỳ thi JLPT N5',
        imageRes: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400',
        vip: false,
        rating: 4.7,
        likes: 180,
        reviews: 65,
        dislikes: 8
      }
    ];

    const mockProgress: UserProgress[] = [
      { courseId: '1', progress: 0.65, completedLessons: ['1', '2'], totalLessons: 10 }
    ];

    setCourses(mockCourses);
    setUserProgress(mockProgress);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === 1) {
      return matchesSearch && userProgress.some(p => p.courseId === course.id);
    }
    if (selectedTab === 2) {
      return matchesSearch && course.vip;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Tìm khóa học"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="p-2 hover:bg-gray-100 rounded-full">
              👥
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              👤
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`py-4 px-2 border-b-2 font-medium whitespace-nowrap ${
                selectedTab === index
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">{tabs[selectedTab]}</h2>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedTab === 1
                ? 'Bạn chưa tham gia khóa học nào'
                : selectedTab === 2
                ? 'Không có khóa học VIP nào'
                : 'Không tìm thấy khóa học nào'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                progress={userProgress.find(p => p.courseId === course.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const CourseCard: React.FC<{
  course: Course;
  progress?: UserProgress;
}> = ({ course, progress }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={course.imageRes}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.vip && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
            VIP
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            ⭐ {course.rating}
          </div>
          <div className="flex items-center gap-1">
            👍 {course.likes}
          </div>
          <div className="flex items-center gap-1">
            💬 {course.reviews}
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{progress.completedLessons.length}/{progress.totalLessons} bài học</span>
              <span>{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
          {progress ? 'Tiếp tục học' : 'Xem chi tiết'}
        </button>
      </div>
    </div>
  );
};

export default CoursesScreen;