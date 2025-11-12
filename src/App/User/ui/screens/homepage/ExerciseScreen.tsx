import React, { useState, useEffect } from 'react';

interface Exercise {
  id: string;
  title: string;
  type: 'VIDEO' | 'PRACTICE';
  videoUrl?: string;
  explanation?: string;
}

const ExerciseScreen: React.FC = () => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setExercise({
        id: '1',
        title: 'Giới thiệu bảng chữ cái Hiragana',
        type: 'VIDEO',
        videoUrl: 'https://drive.google.com/uc?id=sample',
        explanation: `I. Giới thiệu các loại chữ trong tiếng Nhật
Trong tiếng Nhật có 3 loại chữ:

a. Kanji (chữ Hán): 日本
b. Hiragana (chữ mềm): にほん
c. Katakana (chữ cứng): 二ホン

II. Giới thiệu bảng chữ cái Hiragana
- Bảng Hiragana gồm 46 chữ cái.
- Hàng あ: あ(a), い(i), う(u), え(e), お(o).`
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const explanationSections = exercise?.explanation
    ?.split('\n\n')
    .filter(s => s.trim())
    .map(section => {
      const lines = section.split('\n');
      return {
        title: lines[0],
        content: lines.slice(1).join('\n')
      };
    }) || [];

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button className="hover:bg-gray-100 p-2 rounded-full">←</button>
          <h1 className="text-lg font-bold">{exercise?.title}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Intro Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">▶️</span>
            </div>
            <h2 className="text-xl font-bold">{exercise?.title}</h2>
          </div>
          <p className="text-gray-600">
            Xem video và học các khái niệm cơ bản trong bài học này.
            Sau đó làm bài tập để củng cố kiến thức.
          </p>
        </div>

        {/* Video Player */}
        {exercise?.videoUrl && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">▶️</div>
                <p className="text-sm">Video Player</p>
                <p className="text-xs opacity-75 mt-2">Nhấn vào video để phát/tạm dừng</p>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-xl font-bold">Nội dung bài học</h2>
          </div>

          <div className="space-y-3">
            {explanationSections.map((section, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-bold text-left">{section.title}</span>
                  </div>
                  <span className="text-green-600 text-xl">
                    {expandedSections[index] ? '▲' : '▼'}
                  </span>
                </button>

                {expandedSections[index] && (
                  <div className="p-4 border-t bg-gray-50">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {section.content}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Practice Button */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✏️</span>
            </div>
            <h2 className="text-xl font-bold">Luyện tập</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Làm bài tập để củng cố kiến thức vừa học.
            Bạn cần hoàn thành bài tập để mở khóa bài học tiếp theo.
          </p>
          <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl">
            ▶️ BẮT ĐẦU LUYỆN TẬP
          </button>
        </div>
      </main>
    </div>
  );
};

export default ExerciseScreen;