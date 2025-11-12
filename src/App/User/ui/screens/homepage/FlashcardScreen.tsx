import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FlashcardRepository } from '../../../data/repository';

type Flashcard = {
  id?: string;
  term: string;
  definition: string;
  lessonId?: string;
  type?: string;
};

const flashcardRepo = new FlashcardRepository();

const FlashcardScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [studyConfig, setStudyConfig] = useState<{
    cardTypes: string[];
    cardCount: number;
  } | null>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ['Hiragana', 'Katakana', 'Kanji', 'Từ vựng'];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await flashcardRepo.getAllFlashcards();
        if (mounted) {
          setFlashcards(data as Flashcard[]);
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) setError('Không thể tải thẻ.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const cardsForTab = flashcards.filter((c) => {
    if (selectedTab === 0) return c.type === 'hiragana' || !c.type;
    if (selectedTab === 1) return c.type === 'katakana';
    if (selectedTab === 2) return c.type === 'kanji';
    return c.type === 'vocabulary';
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Flashcard Nhật Ngữ</Text>
          <Text style={styles.subtitle}>Học hiệu quả - Nhớ lâu hơn</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowStartDialog(true)}
          style={styles.startButton}
        >
          <Text style={styles.startButtonText}>▶ Bắt đầu học</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(idx)}
            style={[
              styles.tab,
              selectedTab === idx ? styles.tabActive : styles.tabInactive,
            ]}
          >
            <Text style={selectedTab === idx ? styles.tabTextActive : styles.tabTextInactive}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#16a34a" />
        ) : error ? (
          <Text>{error}</Text>
        ) : (
          <FlatList
            data={cardsForTab}
            keyExtractor={(item) => item.id || item.term}
            numColumns={3}
            renderItem={({ item }) => <FlashcardItem flashcard={item} />}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 48 }}
          />
        )}
      </View>

      <StudySetupDialog
        visible={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onStart={(config) => {
          setStudyConfig(config);
          setShowStartDialog(false);
        }}
      />

      {studyConfig && (
        <PracticeSession
          config={studyConfig}
          flashcards={cardsForTab}
          onClose={() => setStudyConfig(null)}
        />
      )}
    </SafeAreaView>
  );
};

const FlashcardItem: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => setIsFlipped(!isFlipped)}
      style={styles.card}
    >
      {isFlipped ? (
        <Text style={styles.cardDefinition}>{flashcard.definition}</Text>
      ) : (
        <Text style={styles.cardTerm}>{flashcard.term}</Text>
      )}
    </TouchableOpacity>
  );
};

const StudySetupDialog: React.FC<{
  visible: boolean;
  onClose: () => void;
  onStart: (config: { cardTypes: string[]; cardCount: number }) => void;
}> = ({ visible, onClose, onStart }) => {
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
      setSelectedTypes((prev) => {
        const filtered = prev.filter((t) => t !== 'mixed');
        return prev.includes(type) ? filtered.filter((t) => t !== type) : [...filtered, type];
      });
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Thiết lập học tập</Text>

          <Text style={styles.modalSubtitle}>Chọn loại thẻ (có thể chọn nhiều)</Text>
          <View style={styles.typeRow}>
            {cardTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => toggleType(option.value)}
                style={selectedTypes.includes(option.value) ? styles.typeSelected : styles.typeButton}
              >
                <Text style={selectedTypes.includes(option.value) ? styles.typeTextSelected : styles.typeText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.modalSubtitle, { marginTop: 12 }]}>Số lượng thẻ: {cardCount}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {cardCountOptions.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCardCount(c)}
                style={cardCount === c ? styles.countSelected : styles.countButton}
              >
                <Text style={cardCount === c ? styles.countTextSelected : styles.countText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity onPress={onClose} style={styles.modalCancel}>
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectedTypes.length > 0 && onStart({ cardTypes: selectedTypes, cardCount })}
              style={[styles.modalStart, { opacity: selectedTypes.length === 0 ? 0.5 : 1 }]}
              disabled={selectedTypes.length === 0}
            >
              <Text style={{ color: 'white' }}>▶ Bắt đầu học</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  const progress = limitedCards.length ? ((currentIndex + 1) / limitedCards.length) * 100 : 0;

  const checkAnswer = () => {
    if (!currentCard) return;
    if (userAnswer.trim().toLowerCase() === currentCard.definition.trim().toLowerCase()) {
      setScore((s) => s + 10);
      nextCard();
    } else {
      setRemainingAttempts((r) => r - 1);
      if (remainingAttempts <= 1) {
        setIsFlipped(true);
      }
    }
  };

  const nextCard = () => {
    if (currentIndex < limitedCards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
      setIsFlipped(false);
      setRemainingAttempts(2);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Luyện tập</Text>
            <Text style={{ color: '#16a34a', fontWeight: '700' }}>Điểm: {score}</Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Thẻ {currentIndex + 1}/{limitedCards.length}</Text>
              <Text>{Math.round(progress)}%</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 8, marginTop: 6 }}>
              <View style={{ width: `${progress}%`, height: 8, backgroundColor: '#16a34a', borderRadius: 8 }} />
            </View>
          </View>

          <View style={{ marginTop: 20, borderRadius: 16, padding: 24, backgroundColor: '#f0fdf4', alignItems: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: '800' }}>{currentCard?.term}</Text>
            {isFlipped && (
              <Text style={{ marginTop: 12, fontSize: 20, color: '#16a34a' }}>Đáp án: {currentCard?.definition}</Text>
            )}
          </View>

          {!isFlipped ? (
            <View style={{ marginTop: 12 }}>
              <TextInput
                placeholder="Nhập đáp án"
                value={userAnswer}
                onChangeText={setUserAnswer}
                onSubmitEditing={checkAnswer}
                style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 8 }}
              />
              <TouchableOpacity onPress={checkAnswer} style={{ marginTop: 12, backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Kiểm tra</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={nextCard} style={{ marginTop: 12, backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Tiếp tục</Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
            <TouchableOpacity onPress={() => setIsFlipped((s) => !s)} style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}>
              <Text>Bỏ qua</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}>
              <Text>Dừng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#16a34a' },
  title: { color: 'white', fontSize: 18, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.9)' },
  startButton: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  startButtonText: { color: '#16a34a', fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 12 },
  tab: { marginRight: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#16a34a' },
  tabInactive: {},
  tabTextActive: { color: '#16a34a', fontWeight: '700' },
  tabTextInactive: { color: '#6b7280' },
  content: { flex: 1, padding: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, width: '30%', aspectRatio: 1, marginBottom: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  cardTerm: { fontSize: 28, fontWeight: '800' },
  cardDefinition: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#16a34a' },
  modalSubtitle: { marginTop: 8, fontWeight: '600' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  typeButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 999, marginRight: 8 },
  typeSelected: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#16a34a', borderRadius: 999, marginRight: 8 },
  typeText: { color: '#374151' },
  typeTextSelected: { color: 'white' },
  countButton: { padding: 12, backgroundColor: '#f3f4f6', borderRadius: 999, marginRight: 8 },
  countSelected: { padding: 12, backgroundColor: '#16a34a', borderRadius: 999, marginRight: 8 },
  countText: {},
  countTextSelected: { color: 'white' },
  modalCancel: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  modalStart: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, backgroundColor: '#16a34a' },
});

export default FlashcardScreen;