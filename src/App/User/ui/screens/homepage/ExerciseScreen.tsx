import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import type { Exercise as ExerciseModel } from '../../../data/models';
import { ExerciseRepository } from '../../../data/repository/ExerciseRepository';

type Props = any;

const ExerciseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { lessonId, sublessonId } = route?.params || {};
  const [exercises, setExercises] = useState<ExerciseModel[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exerciseRepo = new ExerciseRepository();

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!lessonId || !sublessonId) {
          setError('Missing lesson or sub-lesson id');
          setExercises([]);
          return;
        }

        const list = await exerciseRepo.getExercisesBySubLessonId(sublessonId, lessonId);
        setExercises(list);
      } catch (err) {
        console.error('Error loading exercises:', err);
        setError('Không thể tải bài tập từ Firestore');
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, [lessonId, sublessonId]);

  const toggleSection = (index: number) => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.muted}>Đang tải bài tập...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>⚠️ Lỗi</Text>
          <Text style={styles.muted}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Quay lại</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const exercise = exercises[0] || null;

  const explanationSections = exercise?.explanation
    ?.split('\n\n')
    .filter((s: string) => s.trim())
    .map((section: string) => {
      const lines = section.split('\n');
      return {
        title: lines[0],
        content: lines.slice(1).join('\n')
      };
    }) || [];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{exercise?.title || 'Bài tập'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {exercise && (
          <View style={styles.card}>
            <View style={styles.row}><View style={styles.iconCircle}><Text>▶️</Text></View><Text style={styles.cardTitle}>{exercise.title}</Text></View>
            <Text style={styles.muted}>Xem nội dung bài tập và làm các phần luyện tập tương ứng.</Text>
          </View>
        )}

        {exercise?.videoUrl && (
          <View style={styles.card}><View style={styles.videoPlaceholder}><Text style={{ color: '#fff' }}>Video Player</Text></View></View>
        )}

        <View style={styles.card}>
          <View style={styles.row}><View style={styles.iconCircle}><Text>📚</Text></View><Text style={styles.cardTitle}>Nội dung bài học</Text></View>

          <View>
            {explanationSections.map((section: any, index: number) => (
              <View key={index} style={styles.sectionBox}>
                <TouchableOpacity onPress={() => toggleSection(index)} style={styles.sectionHeader}>
                  <View style={styles.sectionLeft}><View style={styles.numCircle}><Text style={{ fontWeight: '700' }}>{index + 1}</Text></View><Text style={styles.sectionTitleText}>{section.title}</Text></View>
                  <Text style={styles.expandIcon}>{expandedSections[index] ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedSections[index] && (
                  <View style={styles.sectionContent}><Text style={styles.pre}>{section.content}</Text></View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}><View style={styles.iconCircle}><Text>✏️</Text></View><Text style={styles.cardTitle}>Luyện tập</Text></View>
          <Text style={styles.muted}>Làm bài tập để củng cố kiến thức vừa học.</Text>
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]}><Text style={styles.primaryBtnText}>▶️ BẮT ĐẦU LUYỆN TẬP</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  centeredScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  container: { padding: 16, paddingBottom: 48 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '700' },
  videoPlaceholder: { height: 200, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  sectionBox: { marginBottom: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center', backgroundColor: '#fff' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center' },
  numCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  sectionTitleText: { fontWeight: '700' },
  expandIcon: { color: '#16a34a' },
  sectionContent: { padding: 12, backgroundColor: '#f8fafc' },
  pre: { fontFamily: 'monospace' },
  primaryBtn: { backgroundColor: '#16a34a', padding: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  errorCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginBottom: 8 }
});

export default ExerciseScreen;