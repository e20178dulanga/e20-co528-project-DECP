import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiJobs } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';

export default function JobsScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await apiJobs.get('/jobs');
      setJobs(response.data.jobs || response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await apiJobs.post(`/jobs/${jobId}/apply`);
      Alert.alert('Success', 'Application submitted successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to apply';
      Alert.alert('Application Failed', msg);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
        </View>
        <View style={styles.jobBadge}>
          <Text style={styles.jobType}>{item.type?.toUpperCase() || 'JOB'}</Text>
        </View>
      </View>
      
      {item.location && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      )}
      
      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
      
      <View style={styles.footer}>
        <View style={styles.deadlineContainer}>
          <Ionicons name="time-outline" size={16} color="#64748b" />
          <Text style={styles.deadline}>
            {item.deadline ? new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.applyButton, item.open === false && styles.applyButtonDisabled]} 
          onPress={() => handleApply(item._id)}
          disabled={item.open === false}
          activeOpacity={0.8}
        >
          <Text style={[styles.applyButtonText, item.open === false && styles.applyButtonTextDisabled]}>
            {item.open === false ? 'Closed' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </View>
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
        <FlatList
          data={jobs}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No jobs right now.</Text>
              <Text style={styles.emptySubtext}>Check back later for new opportunities.</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fb' },
  listContainer: { padding: 16 },
  jobCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 3, 
    shadowColor: '#003366', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8 
  },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleContainer: { flex: 1, marginRight: 12 },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  companyName: { fontSize: 15, fontWeight: '500', color: '#003366' },
  jobBadge: { 
    backgroundColor: '#e6f0fa', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  jobType: { fontSize: 11, fontWeight: '700', color: '#003366', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  location: { fontSize: 14, color: '#64748b', marginLeft: 6, fontWeight: '500' },
  description: { fontSize: 15, color: '#334155', lineHeight: 24, marginBottom: 20 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9', 
    paddingTop: 16,
    flexWrap: 'wrap',
    gap: 12
  },
  deadlineContainer: { flexDirection: 'row', alignItems: 'center' },
  deadline: { fontSize: 13, color: '#64748b', marginLeft: 6, fontWeight: '500' },
  applyButton: { 
    backgroundColor: '#003366', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  applyButtonDisabled: { backgroundColor: '#f1f5f9', shadowOpacity: 0, elevation: 0 },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  applyButtonTextDisabled: { color: '#94a3b8' },
  emptyContainer: { alignItems: 'center', marginTop: '40%' },
  emptyText: { marginTop: 16, color: '#64748b', fontSize: 18, fontWeight: '600' },
  emptySubtext: { marginTop: 8, color: '#94a3b8', fontSize: 14 },
});
