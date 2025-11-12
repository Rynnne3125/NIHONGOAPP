import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import type { User, Course, UserProgress } from '../../../data/models';
import { UserRepository } from '../../../data/repository/UserRepository';
import { CourseRepository } from '../../../data/repository/CourseRepository';

interface HomeScreenProps extends NativeStackScreenProps<any> {
  userRepo: UserRepository;
  courseRepo: CourseRepository;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation, userRepo, courseRepo }) => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accept multiple param name styles (camelCase, snake_case) and nested user object
  const userEmail = route?.params?.userEmail || route?.params?.user_email || route?.params?.user?.email || '';

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userEmail) {
          setError('User email not provided');
          return;
        }

        const userData = await userRepo.getUserByEmail(userEmail);
        if (!userData) {
          setError('User not found in Firestore');
          return;
        }
        setUser(userData);

        const progressData = await userRepo.getAllUserProgress(userData.id);
        setUserProgress(progressData || []);

        const coursesData = await courseRepo.getAllCourses();
        setCourses(coursesData || []);
      } catch (err) {
        console.error('Error loading HomeScreen data:', err);
        setError('Failed to load data from Firestore');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userEmail, userRepo, courseRepo]);

  const totalLessons = userProgress.reduce((sum, p) => sum + (p.totalLessons || 0), 0);
  const completedLessons = userProgress.reduce((sum, p) => sum + (p.completedLessons?.length || 0), 0);
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Đang tải dữ liệu từ Firestore...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.cardSmall}>
          <Text style={styles.errorTitle}>⚠️ Lỗi</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.smallText}>{userEmail ? `Email: ${userEmail}` : 'Không có email người dùng'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.cardSmall}>
          <Text style={styles.errorTitle}>Người dùng không tìm thấy</Text>
          <Text style={styles.errorText}>Vui lòng kiểm tra email và đăng nhập lại.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('login')}>
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>👋 こんにちわ {user.username} さん</Text>
            {user.vip && <Text style={styles.vipText}>⭐ VIP です!</Text>}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Text>👥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Text>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
            <View style={styles.flex1}>
              <Text style={styles.userName}>{user?.username}</Text>
              <View style={styles.rowSmall}>
                <Text style={styles.smallText}>{user?.rank}</Text>
                {user?.vip && <View style={styles.vipBadge}><Text style={styles.vipBadgeText}>VIP</Text></View>}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#fff7ed' }]}>
              <Text style={styles.statValue}>{user?.activityPoints || 0}</Text>
              <Text style={styles.statLabel}>Điểm năng động</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
              <Text style={styles.statValue}>{userProgress.length}</Text>
              <Text style={styles.statLabel}>Khóa học</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
              <Text style={styles.statValue}>N{user?.jlptLevel || 'A'}</Text>
              <Text style={styles.statLabel}>JLPT Level</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={{ marginTop: 10 }}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Tiến độ học tập</Text>
              <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.smallText}>{completedLessons}/{totalLessons} bài học</Text>
              <Text style={styles.smallText}>Cập nhật: {new Date().toLocaleDateString('vi-VN')}</Text>
            </View>
          </View>
        </View>

        {/* Your Progress */}
        {userProgress.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Tiến độ của bạn</Text>
            <FlatList
              data={userProgress}
              keyExtractor={(item) => item.courseId}
              renderItem={({ item }) => {
                const course = courses.find(c => c.id === item.courseId);
                return (
                  <View style={styles.courseCard}>
                    <View style={styles.rowCenter}>
                      <Image source={{ uri: course?.imageRes }} style={styles.courseImage} />
                      <View style={styles.flex1}>
                        <Text style={styles.courseTitle}>{item.courseTitle}</Text>
                        <Text style={styles.smallText}>{item.completedLessons.length}/{item.totalLessons} lessons</Text>
                      </View>
                      <Text style={styles.progressValue}>{Math.round(item.progress * 100)}%</Text>
                    </View>
                    <TouchableOpacity style={styles.continueButton} onPress={() => {}}>
                      <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        )}

        {/* Learning Tools */}
        <View>
          <Text style={styles.sectionTitle}>Công cụ học tập</Text>
          <View style={styles.toolsGrid}>
            <LearningToolCard title="Flashcards" icon="📇" color="#ef4444" />
            <LearningToolCard title="Bảng xếp hạng" icon="🏆" color="#3b82f6" />
            <LearningToolCard title="Cộng đồng" icon="👥" color="#7c3aed" />
            <LearningToolCard title="Luyện tập" icon="💪" color="#f97316" />
          </View>
        </View>

        {/* All Courses */}
        <View>
          <Text style={styles.sectionTitle}>Tất cả khóa học</Text>
          <FlatList
            data={courses}
            horizontal
            keyExtractor={(c) => c.id}
            renderItem={({ item: course }) => (
              <TouchableOpacity key={course.id} onPress={() => {}} style={styles.courseListItem}>
                <Image source={{ uri: course.imageRes }} style={styles.courseListImage} />
                <View style={styles.courseListBody}>
                  <Text style={styles.courseListTitle} numberOfLines={1}>{course.title}</Text>
                  <Text style={styles.smallText} numberOfLines={2}>{course.description}</Text>
                  <View style={styles.rowSmall}>
                    <Text style={styles.smallText}>⭐ {course.rating}</Text>
                    <Text style={[styles.smallText, { marginLeft: 8 }]}>👍 {course.likes}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const LearningToolCard: React.FC<{ title: string; icon: string; color: string }> = ({ title, icon, color }) => {
  return (
    <TouchableOpacity style={[styles.toolCard, { backgroundColor: color }]} onPress={() => {}}>
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={styles.toolTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  cardSmall: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '90%', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginBottom: 8 },
  errorText: { color: '#374151', marginBottom: 8, textAlign: 'center' },
  smallText: { color: '#6b7280', fontSize: 12 },
  primaryButton: { marginTop: 12, backgroundColor: '#16a34a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  vipText: { color: '#f59e0b' },
  headerButtons: { flexDirection: 'row' },
  iconButton: { padding: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
  flex1: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700' },
  rowSmall: { flexDirection: 'row', alignItems: 'center' },
  vipBadge: { backgroundColor: '#fde68a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  vipBadgeText: { color: '#92400e', fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statCard: { flex: 1, padding: 10, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontWeight: '600' },
  progressValue: { color: '#16a34a', fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginTop: 6 },
  progressBarFill: { height: 8, backgroundColor: '#16a34a' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginVertical: 8 },
  courseCard: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginVertical: 6 },
  courseImage: { width: 56, height: 56, borderRadius: 8, marginRight: 10 },
  courseTitle: { fontWeight: '700' },
  continueButton: { marginTop: 8, backgroundColor: '#2563eb', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  continueButtonText: { color: '#fff', fontWeight: '700' },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: { width: '48%', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  toolIcon: { fontSize: 26, marginBottom: 6 },
  toolTitle: { color: '#fff', fontWeight: '700' },
  courseListItem: { width: 220, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', marginRight: 12 },
  courseListImage: { width: '100%', height: 120 },
  courseListBody: { padding: 8 },
  courseListTitle: { fontWeight: '700', fontSize: 14 },
});

export default HomeScreen;