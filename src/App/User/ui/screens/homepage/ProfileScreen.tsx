import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';

interface User {
  id: string;
  username: string;
  email: string;
  imageUrl: string;
  vip: boolean;
  rank: string;
  jlptLevel: number | null;
  studyMonths: number | null;
  activityPoints: number;
}

interface UserProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
  passedExercises: string[];
  lastUpdated: number;
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedJlptLevel, setEditedJlptLevel] = useState<number | null>(null);
  const [editedStudyMonths, setEditedStudyMonths] = useState<number | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showVipDialog, setShowVipDialog] = useState(false);

  useEffect(() => {
    const mockUser: User = {
      id: '1',
      username: 'Học viên',
      email: 'user@example.com',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      vip: false,
      rank: 'Beginner',
      jlptLevel: 5,
      studyMonths: 6,
      activityPoints: 350
    };

    setUser(mockUser);
    setEditedUsername(mockUser.username);
    setEditedJlptLevel(mockUser.jlptLevel);
    setEditedStudyMonths(mockUser.studyMonths);

    setUserProgress([
      {
        courseId: '1',
        courseTitle: 'Hiragana Cơ Bản',
        progress: 0.65,
        passedExercises: ['1', '2', '3'],
        lastUpdated: Date.now()
      }
    ]);
  }, []);

  const handleSave = () => {
    if (user && editedUsername) {
      setUser({
        ...user,
        username: editedUsername,
        jlptLevel: editedJlptLevel,
        studyMonths: editedStudyMonths
      });
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUsername(user.username);
      setEditedJlptLevel(user.jlptLevel);
      setEditedStudyMonths(user.studyMonths);
    }
    setIsEditMode(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>👋 こんにちわ {user?.username} さん</Text>
          {user?.vip && <Text style={styles.vipBadge}>⭐ VIP です!</Text>}
        </View>
        <View style={styles.headerActions}>
          {isEditMode ? (
            <>
              <TouchableOpacity onPress={handleCancel} style={styles.iconBtn}><Text>✕</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.iconBtn}><Text>✓</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.iconBtn}><Text>👥</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditMode(true)} style={styles.iconBtn}><Text>✏️</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.centered}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
            {isEditMode && (
              <TouchableOpacity style={styles.editAvatarBtn}><Text style={{ color: 'white' }}>✏️</Text></TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.card}>
          {isEditMode ? (
            <>
              <View style={styles.formRow}>
                <Text style={styles.label}>Username</Text>
                <TextInput value={editedUsername} onChangeText={setEditedUsername} style={styles.input} />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Email</Text>
                <TextInput value={user?.email} editable={false} style={[styles.input, styles.inputDisabled]} />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>JLPT Level</Text>
                <TextInput value={editedJlptLevel?.toString() || ''} onChangeText={t => setEditedJlptLevel(t ? Number(t) : null)} keyboardType="numeric" style={styles.input} />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Months of Study</Text>
                <TextInput value={editedStudyMonths?.toString() || ''} onChangeText={t => setEditedStudyMonths(t ? Number(t) : null)} keyboardType="numeric" style={styles.input} />
              </View>
            </>
          ) : (
            <>
              <InfoRow label="Username" value={user?.username} icon="👤" />
              <InfoRow label="JLPT Level" value={user?.jlptLevel ? `N${user.jlptLevel}` : 'Not set'} icon="⭐" />
              <InfoRow label="Months of Study" value={user?.studyMonths?.toString() || 'Not set'} icon="✓" />
              <InfoRow label="Activity Points" value={user?.activityPoints.toString()} icon="🏆" />
              <InfoRow label="VIP Status" value={user?.vip ? '⭐ VIP' : 'Standard'} icon="💎" />
            </>
          )}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          {userProgress.length === 0 ? (
            <View style={[styles.card, styles.centered]}> 
              <Text style={styles.muted}>You haven't joined any courses yet</Text>
              <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Browse Courses</Text></TouchableOpacity>
            </View>
          ) : (
            <View>
              {userProgress.map(progress => (
                <View key={progress.courseId} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>{progress.courseTitle}</Text>
                    <Text style={styles.progressPercent}>{Math.round(progress.progress * 100)}%</Text>
                  </View>
                  <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress.progress * 100}%`}]} /></View>
                  <View style={styles.progressMeta}>
                    <Text style={styles.smallText}>{progress.passedExercises.length} exercises completed</Text>
                    <Text style={styles.smallText}>Last updated: {new Date(progress.lastUpdated).toLocaleDateString('vi-VN')}</Text>
                  </View>
                  <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Continue</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ marginTop: 12 }}>
          <TouchableOpacity onPress={() => setShowSignOutDialog(true)} style={[styles.primaryBtn, { backgroundColor: '#dc2626' }]}>
            <Text style={styles.primaryBtnText}>Sign Out</Text>
          </TouchableOpacity>

          {!user?.vip && (
            <TouchableOpacity onPress={() => setShowVipDialog(true)} style={[styles.primaryBtn, { backgroundColor: '#f59e0b', marginTop: 8 }]}>
              <Text style={styles.primaryBtnText}>⭐ Nâng cấp lên VIP</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <Modal visible={showSignOutDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowSignOutDialog(false)} style={styles.modalCancel}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { console.log('Sign out'); setShowSignOutDialog(false); }} style={styles.modalConfirm}><Text style={{ color: 'white' }}>Confirm</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showVipDialog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 520, width: '90%' }]}>
            <Text style={styles.modalTitle}>Nâng cấp lên VIP</Text>
            <View style={styles.vipBox}>
              <Text style={styles.vipIcon}>⭐</Text>
              <Text style={styles.vipPlan}>Gói VIP Premium</Text>
              <Text style={styles.vipPrice}>100.000 VNĐ / tháng</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: '700' }}>Quyền lợi thành viên VIP:</Text>
              <BenefitItem text="Truy cập tất cả khóa học VIP" />
              <BenefitItem text="Không giới hạn bài tập và flashcards" />
              <BenefitItem text="Ưu tiên hỗ trợ từ đội ngũ giáo viên" />
              <BenefitItem text="Huy hiệu VIP độc quyền trên hồ sơ" />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowVipDialog(false)} style={styles.modalCancel}><Text>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setShowVipDialog(false)} style={styles.modalConfirm}><Text style={{ color: 'white' }}>Tiếp tục</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const InfoRow: React.FC<{ label: string; value?: string; icon: string; }> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.benefitRow}>
    <Text style={styles.benefitTick}>✓</Text>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#16a34a', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: 'white', fontSize: 16, fontWeight: '700' },
  vipBadge: { color: '#fbbf24' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8 },
  container: { padding: 16, paddingBottom: 48 },
  centered: { alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb' },
  editAvatarBtn: { position: 'absolute', right: -4, bottom: -4, backgroundColor: '#16a34a', padding: 8, borderRadius: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginVertical: 12 },
  formRow: { marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8 },
  inputDisabled: { backgroundColor: '#f3f4f6' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  muted: { color: '#6b7280', marginBottom: 8 },
  primaryBtn: { backgroundColor: '#16a34a', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  progressCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTitle: { fontWeight: '700' },
  progressPercent: { color: '#16a34a', fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: 8, backgroundColor: '#16a34a' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  smallText: { color: '#6b7280' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoIcon: { fontSize: 20 },
  infoLabel: { color: '#6b7280' },
  infoValue: { fontWeight: '700' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  benefitTick: { color: '#16a34a' },
  benefitText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, width: '100%', maxWidth: 420 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#16a34a' },
  modalMessage: { marginTop: 8, color: '#6b7280' },
  modalActions: { flexDirection: 'row', marginTop: 12 },
  modalCancel: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  modalConfirm: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, backgroundColor: '#16a34a' },
  vipBox: { backgroundColor: '#0ea5e9', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12 },
  vipIcon: { fontSize: 28 },
  vipPlan: { color: 'white', fontWeight: '700', marginTop: 6 },
  vipPrice: { color: '#fde68a', fontWeight: '700', marginTop: 2 }
});

export default ProfileScreen;