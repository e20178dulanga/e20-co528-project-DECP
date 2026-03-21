import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { apiAuth } from '../../api/config';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await apiAuth.get('/users/me');
      const data = response.data.user || response.data;
      setProfile(data);
      setBio(data.bio || '');
      setSkills(data.skills ? data.skills.join(', ') : '');
      setLinkedinUrl(data.linkedinUrl || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      await apiAuth.put('/users/me', {
        bio,
        skills: skillsArray,
        linkedinUrl
      });
      setIsEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.role}>{profile?.role?.toUpperCase()}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
              <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={styles.label}>Bio</Text>
              <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline numberOfLines={3} />
              
              <Text style={styles.label}>Skills (comma separated)</Text>
              <TextInput style={styles.input} value={skills} onChangeText={setSkills} />
              
              <Text style={styles.label}>LinkedIn URL</Text>
              <TextInput style={styles.input} value={linkedinUrl} onChangeText={setLinkedinUrl} autoCapitalize="none" />
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Bio:</Text>
              <Text style={styles.infoText}>{profile?.bio || 'No bio provided.'}</Text>
              
              <Text style={styles.infoLabel}>Skills:</Text>
              <Text style={styles.infoText}>
                {profile?.skills?.length ? profile.skills.join(' • ') : 'No skills listed.'}
              </Text>
              
              <Text style={styles.infoLabel}>LinkedIn:</Text>
              <Text style={styles.infoText}>{profile?.linkedinUrl || 'Not provided.'}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  container: { flexGrow: 1, backgroundColor: '#f9f9f9', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 30, width: '100%' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 5, backgroundColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  email: { fontSize: 16, color: '#777', marginTop: 5 },
  content: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366' },
  editButton: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
  editForm: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  infoBox: { width: '100%' },
  infoLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 5 },
  infoText: { fontSize: 16, color: '#333', marginBottom: 5, lineHeight: 22 },
  logoutButton: { backgroundColor: '#d9534f', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
