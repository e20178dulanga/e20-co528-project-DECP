import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiAuth } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  const [tab, setTab] = useState('pending'); // 'pending' | 'all'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const endpoint = tab === 'pending' ? '/admin/pending' : '/admin/users';
      const res = await apiAuth.get(endpoint);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers();
  }, [tab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [tab]);

  const handleApprove = (userId, userName) => {
    Alert.alert('Approve User', `Approve ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', style: 'default',
        onPress: async () => {
          try {
            await apiAuth.put(`/admin/approve/${userId}`);
            fetchUsers();
            Alert.alert('Done', `${userName} has been approved!`);
          } catch (err) {
            Alert.alert('Error', 'Failed to approve user');
          }
        },
      },
    ]);
  };

  const handleReject = (userId, userName) => {
    Alert.alert('Reject User', `Reject ${userName}? They won't be able to log in.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            await apiAuth.put(`/admin/reject/${userId}`);
            fetchUsers();
            Alert.alert('Done', `${userName} has been rejected.`);
          } catch (err) {
            Alert.alert('Error', 'Failed to reject user');
          }
        },
      },
    ]);
  };

  const statusColor = (status) => {
    if (status === 'approved') return '#22c55e';
    if (status === 'rejected') return '#ef4444';
    return '#f59e0b';
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20', borderColor: statusColor(item.status) }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{(item.status || 'pending').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.userMeta}>
        <Text style={styles.metaText}>Role: <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{item.role}</Text></Text>
        <Text style={styles.metaText}>
          Registered: {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
        </Text>
      </View>

      {/* Action buttons — shown for pending users, or non-approved in the 'all' tab */}
      {item.status !== 'approved' && item.role !== 'admin' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item._id, item.name)}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
          {item.status !== 'rejected' && (
            <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item._id, item.name)}>
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabButton, tab === 'pending' && styles.tabActive]} onPress={() => setTab('pending')}>
            <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, tab === 'all' && styles.tabActive]} onPress={() => setTab('all')}>
            <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All Users</Text>
          </TouchableOpacity>
        </View>

        {/* Users List */}
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={renderUser}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name={tab === 'pending' ? 'checkmark-done-circle-outline' : 'people-outline'} size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {tab === 'pending' ? 'No pending registrations!' : 'No users found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {tab === 'pending' ? 'All registrations have been reviewed.' : ''}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fb' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#e2e8f0', alignItems: 'center' },
  tabActive: { backgroundColor: '#003366' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  listContainer: { padding: 16, paddingTop: 8 },
  userCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12,
    elevation: 2, shadowColor: '#003366', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#003366' },
  userName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  userEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  userMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  metaText: { fontSize: 13, color: '#475569' },
  actions: { flexDirection: 'row', gap: 10 },
  approveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e', paddingVertical: 10, borderRadius: 10, gap: 6 },
  approveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 10, gap: 6 },
  rejectText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: '35%' },
  emptyText: { marginTop: 16, color: '#64748b', fontSize: 18, fontWeight: '600' },
  emptySubtext: { marginTop: 8, color: '#94a3b8', fontSize: 14 },
});
