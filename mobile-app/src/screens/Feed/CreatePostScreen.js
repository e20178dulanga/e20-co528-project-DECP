import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFeed } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Error', 'Post must contain text or an image.');
      return;
    }
    
    setLoading(true);
    try {
      if (imageUri) {
        // Submit via multipart/form-data since we have media
        const formData = new FormData();
        if (content.trim()) formData.append('content', content.trim());
        
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('media', {
          uri: imageUri,
          name: filename,
          type: type,
        });

        await apiFeed.post('/posts/media', formData);
      } else {
        // Submit standard text post via JSON
        await apiFeed.post('/posts', { content: content.trim() });
      }
      
      navigation.goBack(); // Return to Feed Screen
    } catch (error) {
      console.error('Failed to create post:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to publish post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            style={[styles.postButton, (!content.trim() && !imageUri) && styles.postButtonDisabled]} 
            onPress={handleSubmit}
            disabled={(!content.trim() && !imageUri) || loading}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Post</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
            textAlignVertical="top"
          />
          
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={28} color="rgba(0,0,0,0.6)" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarAction} onPress={pickImage}>
            <Ionicons name="image" size={24} color="#003366" />
            <Text style={styles.toolbarText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#003366' },
  postButton: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70
  },
  postButtonDisabled: { backgroundColor: '#cbd5e1' },
  postButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  contentContainer: { flex: 1, padding: 16 },
  input: {
    fontSize: 18,
    color: '#0f172a',
    minHeight: 120,
    lineHeight: 28,
  },
  imagePreviewContainer: { marginTop: 16, position: 'relative' },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f1f5f9'
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 14
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc'
  },
  toolbarAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20
  },
  toolbarText: { color: '#003366', fontWeight: '600', marginLeft: 8, fontSize: 15 }
});
