import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFeed, apiAuth } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function ProjectsScreen() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await apiFeed.get('/projects');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }
    setCreating(true);
    try {
      await apiFeed.post('/projects', { title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (projectId) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiFeed.delete(`/projects/${projectId}`);
            fetchProjects();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete project');
          }
        },
      },
    ]);
  };

  const isOwner = (project) => {
    return project.owner === user?.id || project.owner === user?._id || project.ownerName === user?.name;
  };

  const renderProject = ({ item }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        {isOwner(item) && (
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={18} color="#e63946" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.projectDescription} numberOfLines={3}>{item.description}</Text>

      <View style={styles.projectMeta}>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={16} color="#003366" />
          <Text style={styles.metaText}>Owner: {item.ownerName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={16} color="#64748b" />
          <Text style={styles.metaText}>
            {item.collaborators?.length > 0
              ? item.collaborators.map(c => c.name).join(', ')
              : 'No collaborators'}
          </Text>
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.docBadge}>
          <Ionicons name="document-text-outline" size={16} color="#003366" />
          <Text style={styles.docCount}>{item.documents?.length || 0} Documents</Text>
        </View>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Projects</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Projects List */}
        <FlatList
          data={projects}
          keyExtractor={item => item._id}
          renderItem={renderProject}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No projects yet</Text>
              <Text style={styles.emptySubtext}>Tap "New" to create your first project!</Text>
            </View>
          }
        />

        {/* Create Project Modal */}
        <Modal visible={showCreate} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Project</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Project Title"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Project Description"
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowCreate(false); setTitle(''); setDescription(''); }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.createButton, creating && { opacity: 0.5 }]} onPress={handleCreate} disabled={creating}>
                  <Text style={styles.createButtonText}>{creating ? 'Creating...' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#003366', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 4 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  listContainer: { padding: 16, paddingTop: 4 },
  projectCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    elevation: 3, shadowColor: '#003366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  projectTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  projectDescription: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 },
  projectMeta: { marginBottom: 16, gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  projectFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  docBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e6f0fa', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  docCount: { fontSize: 13, fontWeight: '600', color: '#003366' },
  emptyContainer: { alignItems: 'center', marginTop: '35%' },
  emptyText: { marginTop: 16, color: '#64748b', fontSize: 18, fontWeight: '600' },
  emptySubtext: { marginTop: 8, color: '#94a3b8', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  modalInput: { backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, color: '#1a1a1a' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9' },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  createButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, backgroundColor: '#003366' },
  createButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
