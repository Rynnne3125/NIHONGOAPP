import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import type { Course, Lesson, UnitItem, SubLesson } from '../../../data/models';
import { CourseRepository } from '../../../data/repository/CourseRepository';
import { LessonRepository } from '../../../data/repository/LessonRepository';
import { UserRepository } from '../../../data/repository/UserRepository';

interface LessonsScreenProps extends NativeStackScreenProps<any> {
	courseRepo: CourseRepository;
	lessonRepo: LessonRepository;
	userRepo?: UserRepository;
}

const LessonsScreen: React.FC<LessonsScreenProps> = ({ route, navigation, courseRepo, lessonRepo }) => {
	const [selectedTab, setSelectedTab] = useState(0);
	const [course, setCourse] = useState<Course | null>(null);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
	const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const tabs = ['Bài học', 'Tiến độ', 'Tài liệu', 'Đánh giá', 'Thích/Không thích'];

	const courseId = route.params?.courseId || '';
	const userEmail = route.params?.userEmail || '';

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				if (!courseId) {
					setError('Course ID is missing');
					return;
				}

				const courseData = await courseRepo.getCourseById(courseId);
				if (courseData) setCourse(courseData);

				const lessonsData = await lessonRepo.getLessonsByCourseId(courseId);
				setLessons(lessonsData || []);
			} catch (err) {
				console.error('Error loading LessonsScreen data:', err);
				setError('Failed to load lessons from Firestore');
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [courseId, courseRepo, lessonRepo]);

	const toggleLesson = (lessonId: string) => {
		setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
	};

	const toggleUnit = (unitKey: string) => {
		setExpandedUnits(prev => ({ ...prev, [unitKey]: !prev[unitKey] }));
	};

	if (isLoading) {
		return (
			<SafeAreaView style={styles.centered}>
				<ActivityIndicator size="large" color="#16a34a" />
				<Text style={styles.loadingText}>Đang tải bài học từ Firestore...</Text>
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
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Text style={styles.backText}>←</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{course?.title || 'Bài học'}</Text>
			</View>

			{course && (
				<View style={styles.courseHeaderImage}>
					<Image source={{ uri: course.imageRes }} style={styles.courseImage} />
					<View style={styles.courseOverlay} />
					<View style={styles.courseInfo}>
						{course.vip && <View style={styles.vipBadge}><Text style={styles.vipBadgeText}>VIP</Text></View>}
						<Text style={styles.courseTitle}>{course.title}</Text>
						<Text style={styles.smallText}>⭐ {course.rating}</Text>
					</View>
				</View>
			)}

			{/* Tabs */}
			<View style={styles.tabsContainer}>
				{tabs.map((tab, index) => (
					<TouchableOpacity key={index} onPress={() => setSelectedTab(index)} style={[styles.tabButton, selectedTab === index ? styles.tabActive : undefined]}>
						<Text style={[styles.tabText, selectedTab === index ? styles.tabTextActive : undefined]}>{tab}</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Content */}
			<ScrollView contentContainerStyle={styles.container}>
				{selectedTab === 0 && (
					<View style={{ width: '100%' }}>
						{lessons.length === 0 ? (
							<Text style={[styles.smallText, { textAlign: 'center', paddingVertical: 20 }]}>Không có bài học nào</Text>
						) : (
							lessons.map(lesson => (
								<LessonCard
									key={lesson.id}
									lesson={lesson}
									isExpanded={!!expandedLessons[lesson.id]}
									onToggle={() => toggleLesson(lesson.id)}
									expandedUnits={expandedUnits}
									onToggleUnit={toggleUnit}
								/>
							))
						)}
					</View>
				)}

				{selectedTab === 1 && <ProgressTab lessons={lessons} />}
				{selectedTab === 2 && <MaterialsTab />}
			</ScrollView>
		</SafeAreaView>
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
		<View style={styles.lessonCard}>
			<TouchableOpacity onPress={onToggle} style={styles.lessonHeader}>
				<View style={[styles.lessonBadge, isCompleted ? styles.badgeDone : styles.badgeTodo]}>
					<Text style={isCompleted ? styles.badgeDoneText : styles.badgeTodoText}>{isCompleted ? '✓' : lesson.step}</Text>
				</View>

				<View style={styles.flex1}>
					<Text style={styles.lessonTitle}>{lesson.stepTitle}</Text>
					<Text style={styles.smallText}>{lesson.completedUnits}/{lesson.totalUnits} đã hoàn thành</Text>
				</View>

				<Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
			</TouchableOpacity>

			<View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} /></View>

			{isExpanded && (
				<View style={styles.expandedSection}>
					{lesson.overview ? (
						<View style={styles.overviewBox}>
							<Text style={styles.overviewTitle}>Tổng quan</Text>
							<Text style={styles.smallText}>{lesson.overview}</Text>
						</View>
					) : null}

					{lesson.units.map((unit, unitIndex) => {
						const unitKey = `${lesson.id}_${unitIndex}`;
						return (
							<UnitCard key={unitKey} unit={unit} isExpanded={!!expandedUnits[unitKey]} onToggle={() => onToggleUnit(unitKey)} />
						);
					})}
				</View>
			)}
		</View>
	);
};

const UnitCard: React.FC<{
	unit: UnitItem;
	isExpanded: boolean;
	onToggle: () => void;
}> = ({ unit, isExpanded, onToggle }) => {
	return (
		<View style={styles.unitCard}>
			<TouchableOpacity onPress={onToggle} style={styles.unitHeader}>
				<Text style={styles.unitIcon}>📁</Text>
				<View style={styles.flex1}>
					<Text style={styles.unitTitle}>{unit.unitTitle}</Text>
					<Text style={styles.smallText}>{unit.progress}</Text>
				</View>
				<Text style={styles.unitExpand}>{isExpanded ? '▲' : '▼'}</Text>
			</TouchableOpacity>

			{isExpanded && (
				<View style={styles.subLessonList}>
					{unit.subLessons.map(subLesson => (
						<SubLessonItem key={subLesson.id} subLesson={subLesson} />
					))}
				</View>
			)}
		</View>
	);
};

const SubLessonItem: React.FC<{ subLesson: SubLesson }> = ({ subLesson }) => {
	const icon = subLesson.type === 'Video' ? '▶️' : '✏️';

	return (
		<TouchableOpacity style={styles.subLessonItem} onPress={() => {}}>
			<Text style={styles.subIcon}>{icon}</Text>
			<Text style={[styles.flex1, subLesson.isCompleted ? styles.completedText : styles.smallText]}>{subLesson.title}</Text>
			<Text style={styles.subAction}>{subLesson.isCompleted ? '✓' : '→'}</Text>
		</TouchableOpacity>
	);
};

const ProgressTab: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
	const totalLessons = lessons.length;
	const completedLessons = lessons.filter(l => l.completedUnits === l.totalUnits).length;
	const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

	return (
		<View>
			<View style={styles.progressOverview}>
				<Text style={styles.overviewTitle}>Tổng quan tiến độ</Text>
				<View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
				<View style={styles.progressMeta}><Text>Hoàn thành: {completedLessons}/{totalLessons} bài học</Text><Text style={styles.progressValue}>{Math.round(progress)}%</Text></View>
			</View>

			<View>
				<Text style={styles.overviewTitle}>Chi tiết tiến độ bài học</Text>
				{lessons.map(lesson => (
					<View key={lesson.id} style={styles.lessonOverviewRow}>
						<View style={[styles.smallBadge, lesson.completedUnits === lesson.totalUnits ? styles.badgeDone : styles.badgeTodo]}>
							{lesson.completedUnits === lesson.totalUnits ? <Text style={styles.badgeDoneText}>✓</Text> : null}
						</View>
						<Text style={lesson.completedUnits === lesson.totalUnits ? styles.completedText : styles.smallText}>{lesson.stepTitle}</Text>
					</View>
				))}
			</View>
		</View>
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
		<View>
			<Text style={styles.overviewTitle}>Tài liệu khóa học</Text>
			{materials.map((material, index) => (
				<TouchableOpacity key={index} style={styles.materialItem} onPress={() => {}}>
					<Text style={styles.materialIcon}>📚</Text>
					<Text style={styles.flex1}>{material.title}</Text>
					<Text style={styles.subAction}>→</Text>
				</TouchableOpacity>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: '#f8fafc' },
	container: { padding: 16, paddingBottom: 40 },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	loadingText: { marginTop: 12, color: '#6b7280' },
	header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#16a34a' },
	backButton: { padding: 6, marginRight: 8 },
	backText: { color: '#fff', fontSize: 18 },
	headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
	courseHeaderImage: { height: 180, marginBottom: 8 },
	courseImage: { width: '100%', height: '100%' },
	courseOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
	courseInfo: { position: 'absolute', bottom: 12, left: 12 },
	vipBadge: { backgroundColor: '#fde68a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
	vipBadgeText: { color: '#92400e', fontWeight: '700' },
	courseTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
	smallText: { color: '#6b7280', fontSize: 12 },
	tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
	tabButton: { paddingVertical: 12, paddingHorizontal: 14 },
	tabText: { color: '#6b7280' },
	tabActive: { borderBottomWidth: 2, borderColor: '#16a34a' },
	tabTextActive: { color: '#16a34a', fontWeight: '700' },
	lessonCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
	lessonHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
	lessonBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
	badgeDone: { backgroundColor: '#16a34a' },
	badgeTodo: { backgroundColor: '#e5e7eb' },
	badgeDoneText: { color: '#fff', fontWeight: '700' },
	badgeTodoText: { color: '#4b5563', fontWeight: '700' },
	lessonTitle: { fontWeight: '700' },
	expandIcon: { fontSize: 18, color: '#16a34a' },
	progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginHorizontal: 12, marginBottom: 8 },
	progressBarFill: { height: 8, backgroundColor: '#16a34a' },
	expandedSection: { padding: 8 },
	overviewBox: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 8, marginBottom: 8 },
	overviewTitle: { fontWeight: '700', marginBottom: 6 },
	unitCard: { borderTopWidth: 1, borderColor: '#e5e7eb' },
	unitHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
	unitIcon: { marginRight: 8 },
	unitTitle: { fontWeight: '700' },
	subLessonList: { paddingHorizontal: 12, paddingBottom: 8 },
	subLessonItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 8 },
	subIcon: { marginRight: 8 },
	subAction: { color: '#16a34a', marginLeft: 8 },
	completedText: { color: '#16a34a' },
	progressOverview: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
	progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
	progressValue: { color: '#16a34a', fontWeight: '700' },
	lessonOverviewRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
	smallBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
	materialItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
	materialIcon: { marginRight: 8 },
	cardSmall: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '90%', alignItems: 'center' },
	errorTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginBottom: 8 },
	errorText: { color: '#374151', marginBottom: 8, textAlign: 'center' },
	primaryButton: { marginTop: 12, backgroundColor: '#16a34a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
	primaryButtonText: { color: '#fff', fontWeight: '700' },
		flex1: { flex: 1 },
		unitExpand: { color: '#16a34a' },
});

export default LessonsScreen;
