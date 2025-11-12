import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Image, FlatList } from 'react-native';
import type { Course, UserProgress } from '../../../data/models';
import { CourseRepository } from '../../../data/repository/CourseRepository';
import { UserRepository } from '../../../data/repository/UserRepository';

interface CoursesScreenProps extends NativeStackScreenProps<any> {
  courseRepo: CourseRepository;
  userRepo?: UserRepository;
}

const CoursesScreen: React.FC<CoursesScreenProps> = ({ route, navigation, courseRepo, userRepo }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ['Tất cả khóa học', 'Khóa học của tôi', 'Khóa học VIP'];
  const userEmail = route.params?.userEmail || '';

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const coursesData = await courseRepo.getAllCourses();
        setCourses(coursesData || []);

        if (userEmail && userRepo) {
          const userData = await userRepo.getUserByEmail(userEmail);
          if (userData) {
            const progressData = await userRepo.getAllUserProgress(userData.id);
            setUserProgress(progressData || []);
          }
        }
      } catch (err) {
        console.error('Error loading CoursesScreen data:', err);
        setError('Failed to load courses from Firestore');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userEmail, courseRepo, userRepo]);

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Đang tải khóa học từ Firestore...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.cardSmall}>
          <Text style={styles.errorTitle}>⚠️ Lỗi</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header with search */}
      <View style={styles.header}>
        <TextInput
          placeholder="Tìm khóa học"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity key={index} onPress={() => setSelectedTab(index)} style={[styles.tabButton, selectedTab === index ? styles.tabActive : undefined]}>
            <Text style={[styles.tabText, selectedTab === index ? styles.tabTextActive : undefined]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{tabs[selectedTab]}</Text>

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {selectedTab === 1
                ? 'Bạn chưa tham gia khóa học nào'
                : selectedTab === 2
                ? 'Không có khóa học VIP nào'
                : 'Không tìm thấy khóa học nào'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item: course }) => (
              <CourseCard course={course} progress={userProgress.find(p => p.courseId === course.id)} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const CourseCard: React.FC<{ course: Course; progress?: UserProgress }> = ({ course, progress }) => {
  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => {}}>
      <View style={styles.courseImageWrap}>
        <Image source={{ uri: course.imageRes }} style={styles.courseImage} />
        {course.vip && <View style={styles.vipBadge}><Text style={styles.vipBadgeText}>VIP</Text></View>}
      </View>
      <View style={styles.courseBody}>
        <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
        <Text style={styles.smallText} numberOfLines={2}>{course.description}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.smallText}>⭐ {course.rating}</Text>
          <Text style={[styles.smallText, { marginLeft: 8 }]}>👍 {course.likes}</Text>
          <Text style={[styles.smallText, { marginLeft: 8 }]}>💬 {course.reviews}</Text>
        </View>

        {progress && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.progressMetaRow}>
              <Text style={styles.smallText}>{progress.completedLessons.length}/{progress.totalLessons} bài học</Text>
              <Text style={styles.smallText}>{Math.round(progress.progress * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress.progress * 100}%` }]} /></View>
          </View>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Text style={styles.actionButtonText}>{progress ? 'Tiếp tục học' : 'Xem chi tiết'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tabButton: { paddingVertical: 12, paddingHorizontal: 14 },
  tabText: { color: '#6b7280' },
  tabActive: { borderBottomWidth: 2, borderColor: '#16a34a' },
  tabTextActive: { color: '#16a34a', fontWeight: '700' },
  container: { padding: 16, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emptyBox: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#6b7280' },
  courseCard: { width: '48%', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  courseImageWrap: { height: 120, backgroundColor: '#e5e7eb' },
  courseImage: { width: '100%', height: '100%' },
  vipBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fde68a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  vipBadgeText: { color: '#92400e', fontWeight: '700' },
  courseBody: { padding: 10 },
  courseTitle: { fontWeight: '700', fontSize: 14 },
  smallText: { color: '#6b7280', fontSize: 12 },
  statsRow: { flexDirection: 'row', marginTop: 6 },
  progressMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressBarBg: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden', marginTop: 6 },
  progressBarFill: { height: 6, backgroundColor: '#16a34a' },
  actionButton: { marginTop: 8, backgroundColor: '#16a34a', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  cardSmall: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '90%', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginBottom: 8 },
  errorText: { color: '#374151', marginBottom: 8, textAlign: 'center' },
  primaryButton: { marginTop: 12, backgroundColor: '#16a34a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});

export default CoursesScreen;