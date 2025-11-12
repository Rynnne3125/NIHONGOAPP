import React, { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  imageRes: string;
  vip: boolean;
  rating: number;
}

interface SubLesson {
  id: string;
  title: string;
  type: string;
  isCompleted: boolean;
}

interface UnitItem {
  unitTitle: string;
  progress: string;
  subLessons: SubLesson[];
}

interface Lesson {
  id: string;
  step: number;
  stepTitle: string;
  overview: string;
  totalUnits: number;
  completedUnits: number;
  units: UnitItem[];
}

const LessonsScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  const tabs = ['Bài học', 'Tiến độ', 'Tài liệu', 'Đánh giá', 'Thích/Không thích'];

  useEffect(() => {
    // Mock data
    setCourse({
      id: '1',
      title: 'Hiragana Cơ Bản',
      description: 'Học bảng chữ cái Hiragana từ đầu',
      imageRes: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
      vip: false,
      rating: 4.5
    });

    setLessons([
      {
        id: '1',
        step: 1,
        stepTitle: 'Bước 1: Giới thiệu về Hiragana',
        overview: 'Tổng quan bảng chữ Hiragana',
        totalUnits: 2,
        completedUnits: 0,
        units: [
          {
            unitTitle: 'Giới thiệu Hiragana',
            progress: '0/2',
            subLessons: [
              { id: '1-1', title: 'Hiragana là gì?', type: 'Video', isCompleted: false },
              { id: '1-2', title: 'Tại sao nên học Hiragana?', type: 'Practice', isCompleted: false }
            ]
          }
        ]
      },
      {
        id: '2',
        step: 2,
        stepTitle: 'Bước 2: Học hàng あ',
        overview: 'Học các chữ cái: あ, い, う, え, お',
        totalUnits: 3,
        completedUnits: 1,
        units: [
          {
            unitTitle: 'Hàng あ',
            progress: '1/3',
            subLessons: [
              { id: '2-1', title: 'Phát âm và cách viết', type: 'Video', isCompleted: true },
              { id: '2-2', title: 'Từ vựng với あ hàng', type: 'Practice', isCompleted: false },
              { id: '2-3', title: 'Luyện viết hàng あ', type: 'Practice', isCompleted: false }
            ]
          }
        ]
      }
    ]);
  }, []);

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const toggleUnit = (unitKey: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitKey]: !prev[unitKey] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button className="hover:bg-green-700 p-2 rounded-full">←</button>
          <h1 className="text-xl font-bold">{course?.title || 'Loading...'}</h1>
        </div>
      </header>

      {/* Course Header Image */}
      {course && (
        <div className="relative h-48">
          <img
            src={course.imageRes}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            {course.vip && (
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                VIP
              </span>
            )}
            <h2 className="text-2xl font-bold">{course.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>⭐ {course.rating}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[72px] z-40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
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
        {selectedTab === 0 && (
          <div className="space-y-4">
            {lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isExpanded={expandedLessons[lesson.id] || false}
                onToggle={() => toggleLesson(lesson.id)}
                expandedUnits={expandedUnits}
                onToggleUnit={toggleUnit}
              />
            ))}
          </div>
        )}

        {selectedTab === 1 && <ProgressTab lessons={lessons} />}
        {selectedTab === 2 && <MaterialsTab />}
      </main>
    </div>
  );
};

const LessonCard: React.FC<{
  lesson: Lesson;
  isExpanded: boolean;
  onToggle: () => void;
  expandedUnits: Record<string, boolean>;
  onToggleUnit: (unitKey: string) => void;
}> = ({ lesson, isExpanded, onToggle, expandedUnits, onToggleUnit }) => {
  const isCompleted = lesson.completedUnits === lesson.totalUnits;
  const progress = lesson.totalUnits > 0 ? (lesson.completedUnits / lesson.totalUnits) : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Lesson Header */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
            isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {isCompleted ? '✓' : lesson.step}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg">{lesson.stepTitle}</h3>
            <p className="text-sm text-gray-600">
              {lesson.completedUnits}/{lesson.totalUnits} đã hoàn thành
            </p>
          </div>

          <span className="text-2xl text-green-600">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>

        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-600 h-1 rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t">
          {lesson.overview && (
            <div className="p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Tổng quan</h4>
              <p className="text-sm text-gray-700">{lesson.overview}</p>
            </div>
          )}

          {lesson.units.map((unit, unitIndex) => {
            const unitKey = `${lesson.id}_${unitIndex}`;
            return (
              <UnitCard
                key={unitKey}
                unit={unit}
                isExpanded={expandedUnits[unitKey] || false}
                onToggle={() => onToggleUnit(unitKey)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const UnitCard: React.FC<{
  unit: UnitItem;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ unit, isExpanded, onToggle }) => {
  return (
    <div className="border-t">
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
      >
        <span className="text-xl text-green-600">📁</span>
        <div className="flex-1">
          <h4 className="font-semibold">{unit.unitTitle}</h4>
          <p className="text-sm text-gray-500">{unit.progress}</p>
        </div>
        <span className="text-green-600">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {unit.subLessons.map(subLesson => (
            <SubLessonItem key={subLesson.id} subLesson={subLesson} />
          ))}
        </div>
      )}
    </div>
  );
};

const SubLessonItem: React.FC<{ subLesson: SubLesson }> = ({ subLesson }) => {
  const icon = subLesson.type === 'Video' ? '▶️' : '✏️';
  const color = subLesson.isCompleted ? 'text-green-600' : 'text-gray-500';

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
      <span className="text-lg">{icon}</span>
      <span className={`flex-1 ${color}`}>{subLesson.title}</span>
      {subLesson.isCompleted ? (
        <span className="text-green-600">✓</span>
      ) : (
        <span className="text-green-600">→</span>
      )}
    </div>
  );
};

const ProgressTab: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => l.completedUnits === l.totalUnits).length;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold mb-4">Tổng quan tiến độ</h3>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>Hoàn thành: {completedLessons}/{totalLessons} bài học</span>
          <span className="text-green-600 font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Chi tiết tiến độ bài học</h3>
        <div className="space-y-2">
          {lessons.map(lesson => {
            const isCompleted = lesson.completedUnits === lesson.totalUnits;
            return (
              <div key={lesson.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>
                  {isCompleted ? '✓' : ''}
                </div>
                <span className={isCompleted ? 'text-green-600' : 'text-gray-600'}>
                  {lesson.stepTitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MaterialsTab: React.FC = () => {
  const materials = [
    { title: 'Bảng chữ Hiragana', type: 'hiragana' },
    { title: 'Bảng chữ Katakana', type: 'katakana' },
    { title: 'Kanji cơ bản N5', type: 'kanji' },
    { title: 'Từ vựng N5', type: 'vocabulary' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Tài liệu khóa học</h3>
      {materials.map((material, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📚</span>
          <span className="flex-1 font-medium">{material.title}</span>
          <span className="text-green-600">→</span>
        </div>
      ))}
    </div>
  );
};

export default LessonsScreen;