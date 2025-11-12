import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';

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
  const progress = exercises.length ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  const handleWordSelect = (word: string) => {
    if (!selectedWords.includes(word)) setSelectedWords(prev => [...prev, word]);
  };

  const handleWordRemove = (index: number) => setSelectedWords(prev => prev.filter((_, i) => i !== index));

  const handleCheckAnswer = () => {
    if (!currentExercise) return;
    const userAnswer = selectedWords.join(' ');
    const correct = userAnswer === currentExercise.answer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    if (correct) {
      setScore(prev => prev + 10);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedWords([]);
      setIsAnswerChecked(false);
      setIsCorrect(false);
    } else {
      // finished
      // simple alert replacement
      console.log('Quiz finished. Score:', score);
    }
  };

  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {}}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Luyện tập</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.card}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Câu hỏi {currentIndex + 1}/{exercises.length}</Text>
            <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
        </View>

        {!isAnswerChecked ? (
          <>
            <View style={styles.cardLarge}>
              <Text style={styles.questionTitle}>{currentExercise.question}</Text>

              <View style={styles.questionRow}>
                {currentExercise.imageUrl ? (
                  <Image source={{ uri: currentExercise.imageUrl }} style={styles.questionImage} />
                ) : null}
                <View>
                  {currentExercise.kana ? <Text style={styles.kana}>{currentExercise.kana}</Text> : null}
                  {currentExercise.romanji ? <Text style={styles.romanji}>{currentExercise.romanji}</Text> : null}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Câu trả lời của bạn:</Text>
                <View style={styles.answerBox}>
                  {selectedWords.length === 0 ? (
                    <Text style={styles.hintText}>Chọn từ bên dưới để tạo câu trả lời</Text>
                  ) : (
                    <View style={styles.selectedWrap}>
                      {selectedWords.map((w, i) => (
                        <TouchableOpacity key={i} onPress={() => handleWordRemove(i)} style={styles.wordPill}>
                          <Text style={styles.wordText}>{w} ✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Các từ có sẵn:</Text>
                <View style={styles.optionsWrap}>
                  {currentExercise.options.map((opt, idx) => {
                    const selected = selectedWords.includes(opt);
                    return (
                      <TouchableOpacity key={idx} disabled={selected} onPress={() => handleWordSelect(opt)} style={[styles.optionBtn, selected ? styles.optionDisabled : styles.optionActive]}>
                        <Text style={selected ? styles.optionDisabledText : styles.optionText}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <TouchableOpacity disabled={selectedWords.length === 0} style={[styles.checkButton, selectedWords.length === 0 ? styles.buttonDisabled : undefined]} onPress={handleCheckAnswer}>
                <Text style={styles.checkButtonText}>KIỂM TRA</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.resultCard, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
              <View style={[styles.resultIcon, isCorrect ? styles.resultIconCorrect : styles.resultIconWrong]}>
                <Text style={styles.resultIconText}>{isCorrect ? '✓' : '✗'}</Text>
              </View>
              <Text style={[styles.resultTitle, isCorrect ? styles.resultTitleCorrect : styles.resultTitleWrong]}>{isCorrect ? 'Đúng rồi!' : 'Sai rồi!'}</Text>

              <View style={styles.centerRow}>
                <Text style={styles.smallText}>Đáp án đúng:</Text>
                <Text style={styles.answerText}>{currentExercise.answer}</Text>
              </View>

              {!isCorrect && (
                <View style={styles.centerRow}>
                  <Text style={styles.smallText}>Đáp án của bạn:</Text>
                  <Text style={styles.wrongAnswerText}>{selectedWords.join(' ')}</Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <TouchableOpacity style={[styles.nextButton, currentIndex < exercises.length - 1 ? styles.nextPrimary : styles.nextFinish]} onPress={handleNext}>
                <Text style={styles.nextButtonText}>{currentIndex < exercises.length - 1 ? 'TIẾP TỤC' : 'HOÀN THÀNH'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.scoreRow}>
          <Text style={styles.smallText}>Điểm hiện tại: <Text style={styles.scoreText}>{score}</Text></Text>
        </View>

        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} style={[styles.confetti, { left: Math.random() * 300, top: Math.random() * 200 } ]}>🎉</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  backButton: { padding: 6, marginRight: 8 },
  backText: { fontSize: 18 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  container: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  cardLarge: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontWeight: '700', color: '#16a34a' },
  progressValue: { fontWeight: '700', color: '#16a34a' },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  progressBarFill: { height: 8, backgroundColor: '#16a34a' },
  questionTitle: { fontSize: 18, fontWeight: '700', color: '#065f46', textAlign: 'center' },
  questionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  questionImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  kana: { fontSize: 24, fontWeight: '700', color: '#16a34a' },
  romanji: { fontSize: 12, color: '#6b7280' },
  section: { marginTop: 12 },
  sectionLabel: { fontWeight: '600', marginBottom: 8 },
  answerBox: { minHeight: 60, backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  hintText: { color: '#9ca3af' },
  selectedWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordPill: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  wordText: { color: '#166534' },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  optionActive: { backgroundColor: '#fff', borderColor: '#16a34a' },
  optionDisabled: { backgroundColor: '#e5e7eb', borderColor: '#d1d5db' },
  optionText: { color: '#16a34a' },
  optionDisabledText: { color: '#6b7280' },
  checkButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  checkButtonText: { color: '#fff', fontWeight: '700' },
  buttonDisabled: { backgroundColor: '#d1d5db' },
  resultCard: { borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  resultCorrect: { backgroundColor: '#ecfdf5' },
  resultWrong: { backgroundColor: '#fff1f2' },
  resultIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  resultIconCorrect: { backgroundColor: '#16a34a' },
  resultIconWrong: { backgroundColor: '#ef4444' },
  resultIconText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  resultTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  resultTitleCorrect: { color: '#065f46' },
  resultTitleWrong: { color: '#b91c1c' },
  centerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  smallText: { color: '#6b7280' },
  answerText: { color: '#16a34a', fontWeight: '700', marginLeft: 6 },
  wrongAnswerText: { color: '#b91c1c', fontWeight: '700', marginLeft: 6 },
  nextButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  nextPrimary: { backgroundColor: '#16a34a' },
  nextFinish: { backgroundColor: '#2563eb' },
  nextButtonText: { color: '#fff', fontWeight: '700' },
  scoreRow: { alignItems: 'center', marginTop: 8 },
  scoreText: { color: '#16a34a', fontWeight: '700' },
  confettiContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  confetti: { position: 'absolute', fontSize: 24 },
});

export default QuizScreen;