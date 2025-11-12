import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface VipRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

const VipRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<VipRequest[]>([
    { id: '1', userId: 'user1', status: 'pending' },
    { id: '2', userId: 'user2', status: 'pending' },
  ]);

  const approve = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const reject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP Requests</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={r => r.id}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View>
              <Text style={styles.userId}>{item.userId}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <View style={styles.actions}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity onPress={() => approve(item.id)} style={[styles.btn, styles.approveBtn]}>
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => reject(item.id)} style={[styles.btn, styles.rejectBtn]}>
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: '700' },
  container: { padding: 16 },
  requestCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userId: { fontWeight: '700' },
  status: { color: '#6b7280', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  approveBtn: { backgroundColor: '#16a34a' },
  rejectBtn: { backgroundColor: '#dc2626' },
  btnText: { color: 'white', fontWeight: '700', fontSize: 12 },
});

export default VipRequestPage;
