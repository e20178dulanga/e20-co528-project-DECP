import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { apiFeed, FEED_URL } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

// Build full image URL from a relative /uploads/... path
// Mirrors web app logic: FEED_URL.replace(/\/api$/, '') + url
const buildMediaUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim().length === 0) return null;
  // base64 data URIs are already complete image sources — pass through as-is
  if (url.startsWith('data:')) return url;
  // Full URLs — pass through as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path like /uploads/photo.jpg — prepend server base
  const base = FEED_URL.replace(/\/api$/, '');
  return `${base}${url}`;
};

export default function FeedScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await apiFeed.get('/posts');
      setPosts(response.data.posts || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      await apiFeed.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFeed.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const mediaUrl =
      item.mediaFiles && Array.isArray(item.mediaFiles) && item.mediaFiles.length > 0 && item.mediaFiles[0]?.url
        ? buildMediaUrl(item.mediaFiles[0].url)
        : null;

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(item.authorName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.authorName}>{item.authorName || 'Anonymous'}</Text>
            <Text style={styles.timeText}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })
                : 'Just now'}
            </Text>
          </View>
          {(item.author === user?.id || item.author === user?._id) && (
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#e63946" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {item.content ? <Text style={styles.postContent}>{item.content}</Text> : null}

        {/* Media — uses expo-image instead of RN Image to avoid Fabric crash */}
        {mediaUrl && (
          <View style={styles.mediaContainer}>
            <ExpoImage
              source={mediaUrl}
              style={styles.mediaImage}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}

        {/* Footer actions */}
        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item._id)}>
            <Ionicons name="heart-outline" size={20} color="#e63946" style={styles.actionIcon} />
            <Text style={styles.actionText}>
              Like • {item.likeCount || item.likes?.length || item.likes || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#003366" style={styles.actionIcon} />
            <Text style={styles.actionText}>
              Comment • {item.commentCount || item.comments?.length || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No posts yet.</Text>
              <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fb' },
  listContainer: { padding: 16, paddingBottom: 100 },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#e6f0fa',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#003366' },
  headerTextContainer: { flex: 1 },
  authorName: { fontWeight: '700', fontSize: 16, color: '#1a1a1a', marginBottom: 2 },
  timeText: { color: '#8898aa', fontSize: 12, fontWeight: '500' },
  postContent: { fontSize: 15, color: '#334155', marginBottom: 16, lineHeight: 24 },
  mediaContainer: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    marginTop: 4,
  },
  actionButton: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10, borderRadius: 8, marginHorizontal: 4,
  },
  actionIcon: { marginRight: 6 },
  actionText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: '40%' },
  emptyText: { marginTop: 16, color: '#64748b', fontSize: 18, fontWeight: '600' },
  emptySubtext: { marginTop: 8, color: '#94a3b8', fontSize: 14 },
  fab: {
    position: 'absolute',
    width: 64, height: 64,
    alignItems: 'center', justifyContent: 'center',
    right: 24, bottom: 24,
    backgroundColor: '#003366',
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
