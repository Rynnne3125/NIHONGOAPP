import React, { useState, useEffect } from 'react';

interface Exercise {
  id: string;
  question: string;
  answer: string;
  options: string[];
  imageUrl?: string;
  romanji?: string;
  kana?: string;
}

const QuizScreen: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Mock data
    setExercises([
      {
        id: '1',
        question: 'Chuyển sang tiếng Việt',
        answer: 'tình yêu',
        options: ['tình', 'yêu', 'đẹp', 'buồn', 'vui'],
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200',
        kana: 'あい',
        romanji: 'ai'
      },
      {
        id: '2',
        question: 'Chuyển sang tiếng Việt',
        answer: 'nhà',
        options: ['nhà', 'cửa', 'của', 'sổ', 'phòng'],
        imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200',
        kana: 'いえ',
        romanji: 'ie'
      }
    ]);
  }, []);

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  const handleWordSelect = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleWordRemove = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    const userAnswer = selectedWords.join(' ');
    const correct = userAnswer === currentExercise.answer;

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setScore(score + 10);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedWords([]);
      setIsAnswerChecked(false);
      setIsCorrect(false);
    } else {
      // Quiz completed
      alert(`Quiz hoàn thành! Điểm: ${score}`);
    }
  };

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button className="hover:bg-gray-100 p-2 rounded-full">←</button>
          <h1 className="text-lg font-bold">Luyện tập</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-green-700">
              Câu hỏi {currentIndex + 1}/{exercises.length}
            </span>
            <span className="font-bold text-green-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!isAnswerChecked ? (
          <>
            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <h2 className="text-xl font-bold text-green-700 text-center">
                {currentExercise.question}
              </h2>

              {/* Image and Japanese */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                {currentExercise.imageUrl && (
                  <img
                    src={currentExercise.imageUrl}
                    alt="Question"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  {currentExercise.kana && (
                    <div className="text-3xl font-bold text-green-700">
                      {currentExercise.kana}
                    </div>
                  )}
                  {currentExercise.romanji && (
                    <div className="text-sm text-gray-500 italic">
                      {currentExercise.romanji}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Words */}
              <div>
                <p className="text-sm font-medium mb-2">Câu trả lời của bạn:</p>
                <div className="min-h-[60px] bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                  {selectedWords.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">
                      Chọn từ bên dưới để tạo câu trả lời
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedWords.map((word, index) => (
                        <button
                          key={index}
                          onClick={() => handleWordRemove(index)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-full border border-green-300 hover:bg-green-200 transition-colors"
                        >
                          {word} ✕
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Available Options */}
              <div>
                <p className="text-sm font-medium mb-2">Các từ có sẵn:</p>
                <div className="flex flex-wrap gap-2">
                  {currentExercise.options.map((option, index) => {
                    const isSelected = selectedWords.includes(option);
                    return (
                      <button
                        key={index}
                        onClick={() => handleWordSelect(option)}
                        disabled={isSelected}
                        className={`px-4 py-2 rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'bg-white text-green-700 border-green-600 hover:bg-green-50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Check Button */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <button
                onClick={handleCheckAnswer}
                disabled={selectedWords.length === 0}
                className="w-full py-4 bg-green-700 text-white rounded-lg font-bold text-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                KIỂM TRA
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Result Card */}
            <div className={`rounded-xl shadow-md p-8 text-center ${
              isCorrect ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isCorrect ? 'bg-green-600' : 'bg-red-600'
              }`}>
                <span className="text-4xl text-white">
                  {isCorrect ? '✓' : '✗'}
                </span>
              </div>

              <h2 className={`text-3xl font-bold mb-4 ${
                isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {isCorrect ? 'Đúng rồi!' : 'Sai rồi!'}
              </h2>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-600">Đáp án đúng:</span>
                  <span className="text-green-700 font-bold text-lg">
                    {currentExercise.answer}
                  </span>
                </div>

                {!isCorrect && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-600">Đáp án của bạn:</span>
                    <span className="text-red-700 font-bold text-lg">
                      {selectedWords.join(' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <button
                onClick={handleNext}
                className={`w-full py-4 text-white rounded-lg font-bold text-lg transition-colors ${
                  currentIndex < exercises.length - 1
                    ? 'bg-green-700 hover:bg-green-800'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                {currentIndex < exercises.length - 1 ? 'TIẾP TỤC' : 'HOÀN THÀNH'}
              </button>
            </div>
          </>
        )}

        {/* Score Display */}
        <div className="text-center text-gray-600">
          Điểm hiện tại: <span className="font-bold text-green-600">{score}</span>
        </div>
      </main>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${Math.random() * 20 + 20}px`
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizScreen;