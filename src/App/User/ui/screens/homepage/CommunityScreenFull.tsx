import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface User {
  id: string;
  username: string;
  email: string;
  imageUrl: string;
  online: boolean;
  vip: boolean;
  rank: string;
  activityPoints: number;
}

const CommunityScreenFull: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const tabs = ['Cộng đồng', 'Thảo luận', 'Bảng xếp hạng'];

  const users: User[] = Array.from({ length: 10 }, (_, i) => ({
    id: `user-${i}`,
    username: `User ${i + 1}`,
    email: `user${i}@example.com`,
    imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    online: Math.random() > 0.5,
    vip: Math.random() > 0.7,
    rank: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
    activityPoints: Math.floor(Math.random() * 1000)
  }));

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const onlineUsers = users.filter(u => u.online);
  const sortedUsers = [...users].sort((a, b) => b.activityPoints - a.activityPoints);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Community</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab, idx) => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(idx)} style={[styles.tab, selectedTab === idx ? styles.tabActive : undefined]}>
            <Text style={selectedTab === idx ? styles.tabTextActive : styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.smallMuted}>🕐 Đang hoạt động</Text>
          <Text style={styles.timeText}>{currentTime.toLocaleTimeString('vi-VN')}</Text>
        </View>

        {selectedTab === 0 && (
          <View>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Người dùng đang online</Text>
              {onlineUsers.length === 0 ? (
                <Text style={styles.muted}>Không có người dùng nào đang hoạt động</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {onlineUsers.map(u => (
                    <View key={u.id} style={styles.onlineUserItem}>
                      <View style={{ position: 'relative' }}>
                        <Image source={{ uri: u.imageUrl }} style={styles.onlineAvatar} />
                        <View style={styles.onlineDot} />
                      </View>
                      <Text style={styles.username}>{u.username}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View>
              <Text style={styles.sectionTitle}>Đối tác học tập</Text>
              <View>
                {users.slice(0,5).map(u => (
                  <View key={u.id} style={styles.partnerCard}>
                    <Image source={{ uri: u.imageUrl }} style={styles.partnerAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.partnerName}>{u.username}</Text>
                        {u.vip && <Text style={styles.vipMark}> ⭐</Text>}
                      </View>
                      <Text style={styles.smallMuted}>{u.rank}</Text>
                    </View>
                    <TouchableOpacity style={styles.connectBtn}><Text style={{ color: 'white' }}>Kết nối</Text></TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {selectedTab === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Bảng xếp hạng tuần này</Text>
            <Text style={styles.smallMuted}>Dựa trên các điểm học tập</Text>

            <View style={styles.top3Row}>
              {sortedUsers[1] && (
                <View style={styles.rankItem}>
                  <View style={[styles.rankBadge, { backgroundColor: '#9ca3ff' }]}><Text style={styles.rankText}>#2</Text></View>
                  <Image source={{ uri: sortedUsers[1].imageUrl }} style={styles.smallAvatar} />
                  <Text style={styles.partnerName}>{sortedUsers[1].username}</Text>
                  <Text style={styles.scoreText}>{sortedUsers[1].activityPoints} điểm</Text>
                </View>
              )}
              {sortedUsers[0] && (
                <View style={styles.rankItem}>
                  <View style={[styles.rankBadge, { backgroundColor: '#facc15' }]}><Text style={styles.rankText}>#1</Text></View>
                  <Image source={{ uri: sortedUsers[0].imageUrl }} style={styles.smallAvatar} />
                  <Text style={styles.partnerName}>{sortedUsers[0].username}</Text>
                  <Text style={styles.scoreText}>{sortedUsers[0].activityPoints} điểm</Text>
                </View>
              )}
              {sortedUsers[2] && (
                <View style={styles.rankItem}>
                  <View style={[styles.rankBadge, { backgroundColor: '#fb923c' }]}><Text style={styles.rankText}>#3</Text></View>
                  <Image source={{ uri: sortedUsers[2].imageUrl }} style={styles.smallAvatar} />
                  <Text style={styles.partnerName}>{sortedUsers[2].username}</Text>
                  <Text style={styles.scoreText}>{sortedUsers[2].activityPoints} điểm</Text>
                </View>
              )}
            </View>

            <View style={{ marginTop: 12 }}>
              {sortedUsers.slice(3).map((u, idx) => (
                <View key={u.id} style={styles.leaderRow}>
                  <View style={styles.rankIndex}><Text style={{ fontWeight: '700' }}>#{idx + 4}</Text></View>
                  <Image source={{ uri: u.imageUrl }} style={styles.smallAvatar} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.partnerName}>{u.username}</Text>
                    <Text style={styles.smallMuted}>{u.activityPoints} điểm</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12 },
  tab: { marginRight: 12, paddingVertical: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#16a34a' },
  tabText: { color: '#6b7280' },
  tabTextActive: { color: '#16a34a', fontWeight: '700' },
  container: { padding: 16, paddingBottom: 48 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12 },
  smallMuted: { color: '#6b7280' },
  timeText: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  muted: { color: '#6b7280' },
  onlineUserItem: { alignItems: 'center', marginRight: 12 },
  onlineAvatar: { width: 56, height: 56, borderRadius: 28 },
  onlineDot: { position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#fff' },
  username: { marginTop: 6, fontSize: 12, maxWidth: 80, textAlign: 'center' },
  partnerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8 },
  partnerAvatar: { width: 48, height: 48, borderRadius: 24 },
  partnerName: { fontWeight: '700' },
  vipMark: { color: '#fbbf24', marginLeft: 6 },
  connectBtn: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  top3Row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 8, marginVertical: 12 },
  rankItem: { alignItems: 'center', marginHorizontal: 8 },
  rankBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: 'white', fontWeight: '700' },
  smallAvatar: { width: 56, height: 56, borderRadius: 28, marginTop: 8 },
  scoreText: { color: '#16a34a', fontWeight: '700', marginTop: 4 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8 },
  rankIndex: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }
});

export default CommunityScreenFull;