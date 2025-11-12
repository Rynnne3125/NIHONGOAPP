import React, { useState, useEffect } from 'react';

interface Flashcard {
  term: string;
  definition: string;
}

const FlashcardScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [studyConfig, setStudyConfig] = useState<{
    cardTypes: string[];
    cardCount: number;
  } | null>(null);

  const tabs = ['Hiragana', 'Katakana', 'Kanji', 'Từ vựng'];

  const hiraganaCards: Flashcard[] = [
    { term: 'あ', definition: 'a' },
    { term: 'い', definition: 'i' },
    { term: 'う', definition: 'u' },
    { term: 'え', definition: 'e' },
    { term: 'お', definition: 'o' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Flashcard Nhật Ngữ</h1>
              <p className="text-sm opacity-90">Học hiệu quả - Nhớ lâu hơn</p>
            </div>
            <button
              onClick={() => setShowStartDialog(true)}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              ▶ Bắt đầu học
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[88px] z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`py-4 px-2 border-b-2 font-medium ${
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
        <FlashcardGrid flashcards={hiraganaCards} />
      </main>

      {/* Study Setup Dialog */}
      {showStartDialog && (
        <StudySetupDialog
          onClose={() => setShowStartDialog(false)}
          onStart={(config) => {
            setStudyConfig(config);
            setShowStartDialog(false);
          }}
        />
      )}

      {/* Practice Session */}
      {studyConfig && (
        <PracticeSession
          config={studyConfig}
          flashcards={hiraganaCards}
          onClose={() => setStudyConfig(null)}
        />
      )}
    </div>
  );
};

const FlashcardGrid: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {flashcards.map((card, index) => (
        <FlashcardItem key={index} flashcard={card} />
      ))}
    </div>
  );
};

const FlashcardItem: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="aspect-square bg-white rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
    >
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center">
          {isFlipped ? (
            <div className="text-lg font-medium">{flashcard.definition}</div>
          ) : (
            <div className="text-3xl font-bold">{flashcard.term}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudySetupDialog: React.FC<{
  onClose: () => void;
  onStart: (config: { cardTypes: string[]; cardCount: number }) => void;
}> = ({ onClose, onStart }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [cardCount, setCardCount] = useState(10);

  const cardTypeOptions = [
    { value: 'hiragana', label: 'Hiragana' },
    { value: 'katakana', label: 'Katakana' },
    { value: 'kanji', label: 'Kanji' },
    { value: 'vocabulary', label: 'Từ vựng' },
    { value: 'mixed', label: 'Trộn tất cả' },
  ];

  const cardCountOptions = [5, 10, 15, 20, 30, 50];

  const toggleType = (type: string) => {
    if (type === 'mixed') {
      setSelectedTypes(['mixed']);
    } else {
      setSelectedTypes(prev => {
        const filtered = prev.filter(t => t !== 'mixed');
        return prev.includes(type)
          ? filtered.filter(t => t !== type)
          : [...filtered, type];
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Thiết lập học tập</h2>

        {/* Card Type Selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Chọn loại thẻ (có thể chọn nhiều)</h3>
          <div className="flex flex-wrap gap-2">
            {cardTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleType(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTypes.includes(option.value)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedTypes.includes(option.value) && '✓ '}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Count Selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Số lượng thẻ: {cardCount}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cardCountOptions.map(count => (
              <button
                key={count}
                onClick={() => setCardCount(count)}
                className={`w-12 h-12 rounded-full flex-shrink-0 font-medium transition-colors ${
                  cardCount === count
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (selectedTypes.length > 0) {
                onStart({ cardTypes: selectedTypes, cardCount });
              }
            }}
            disabled={selectedTypes.length === 0}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ▶ Bắt đầu học
          </button>
        </div>
      </div>
    </div>
  );
};

const PracticeSession: React.FC<{
  config: { cardTypes: string[]; cardCount: number };
  flashcards: Flashcard[];
  onClose: () => void;
}> = ({ config, flashcards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(2);

  const limitedCards = flashcards.slice(0, config.cardCount);
  const currentCard = limitedCards[currentIndex];
  const progress = ((currentIndex + 1) / limitedCards.length) * 100;

  const checkAnswer = () => {
    if (userAnswer.toLowerCase() === currentCard.definition.toLowerCase()) {
      setScore(score + 10);
      nextCard();
    } else {
      setRemainingAttempts(remainingAttempts - 1);
      if (remainingAttempts <= 1) {
        setIsFlipped(true);
      }
    }
  };

  const nextCard = () => {
    if (currentIndex < limitedCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsFlipped(false);
      setRemainingAttempts(2);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Luyện tập</h2>
          <div className="text-green-600 font-bold">Điểm: {score}</div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Thẻ {currentIndex + 1}/{limitedCards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center">
          <div className="text-6xl font-bold mb-4">{currentCard.term}</div>
          {isFlipped && (
            <div className="text-2xl text-green-600 font-semibold">
              Đáp án: {currentCard.definition}
            </div>
          )}
        </div>

        {/* Attempts */}
        {!isFlipped && (
          <div className="text-center text-sm">
            Lượt còn lại: {'❤️'.repeat(remainingAttempts)}
          </div>
        )}

        {/* Input */}
        {!isFlipped ? (
          <div className="space-y-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Nhập đáp án"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
            />
            <button
              onClick={checkAnswer}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          <button
            onClick={nextCard}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
          >
            Tiếp tục
          </button>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Bỏ qua
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Dừng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardScreen;