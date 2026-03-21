import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiAuth } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function MessagesScreen() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const flatListRef = useRef(null);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await apiAuth.get('/messages/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages with a specific user
  const fetchMessages = async (userId) => {
    try {
      const res = await apiAuth.get(`/messages/${userId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await apiAuth.get(`/users/search?q=${searchQuery}`);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!content.trim() || !activeUser) return;
    setSending(true);
    try {
      await apiAuth.post('/messages', { receiverId: activeUser._id, content: content.trim() });
      setContent('');
      fetchMessages(activeUser._id);
    } catch (err) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  // Poll for new messages when in a chat
  useEffect(() => {
    if (!activeUser) return;
    fetchMessages(activeUser._id);
    const interval = setInterval(() => fetchMessages(activeUser._id), 5000);
    return () => clearInterval(interval);
  }, [activeUser]);

  // Build contacts from conversations
  const contacts = conversations.map(m => {
    const senderId = m.sender?._id || m.sender;
    const isSender = senderId === user?.id || senderId === user?._id;
    const otherUser = isSender ? m.receiver : m.sender;
    return {
      _id: typeof otherUser === 'object' ? otherUser._id : otherUser,
      name: typeof otherUser === 'object' ? otherUser.name : 'User',
      lastMessage: m.content,
      read: isSender ? true : m.read,
    };
  });

  // ────────── CHAT VIEW ──────────
  if (activeUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setActiveUser(null)} style={{ padding: 8, marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#003366" />
            </TouchableOpacity>
            <View style={styles.chatAvatarSmall}>
              <Text style={styles.chatAvatarText}>{(activeUser.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.chatHeaderName}>{activeUser.name}</Text>
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, idx) => item._id || String(idx)}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const senderId = item.sender?._id || item.sender;
              const isMine = senderId === user?.id || senderId === user?._id;
              return (
                <View style={[styles.messageBubbleRow, isMine && styles.messageBubbleRowMine]}>
                  <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMine && { color: '#fff' }]}>{item.content}</Text>
                  </View>
                  <Text style={[styles.messageTime, isMine && { textAlign: 'right' }]}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyChatContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                <Text style={styles.emptyChatText}>Say hi to {activeUser.name}!</Text>
              </View>
            }
          />

          {/* Message Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!content.trim() || sending) && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={!content.trim() || sending}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ────────── CONVERSATIONS LIST VIEW ──────────
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
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={searching}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsTitle}>Search Results</Text>
              <TouchableOpacity onPress={() => { setSearchResults([]); setSearchQuery(''); }}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {searchResults.map(u => (
              <TouchableOpacity
                key={u._id}
                style={styles.contactRow}
                onPress={() => { setActiveUser({ _id: u._id, name: u.name }); setSearchResults([]); setSearchQuery(''); }}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{u.name}</Text>
                  <Text style={styles.contactRole}>{u.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Conversations */}
        <FlatList
          data={contacts}
          keyExtractor={(item, idx) => item._id || String(idx)}
          refreshControl={<RefreshControl refreshing={false} onRefresh={fetchConversations} tintColor="#003366" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.contactRow} onPress={() => setActiveUser({ _id: item._id, name: item.name })}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, !item.read && { fontWeight: '800' }]}>{item.name}</Text>
                <Text style={[styles.lastMessage, !item.read && { color: '#1a1a1a', fontWeight: '600' }]} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Text style={styles.emptySubtext}>Search for a user above to start chatting!</Text>
              </View>
            ) : null
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
  // Search
  searchBar: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  searchButton: { backgroundColor: '#003366', borderRadius: 12, width: 48, justifyContent: 'center', alignItems: 'center' },
  searchResultsContainer: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  searchResultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchResultsTitle: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  clearText: { fontSize: 13, fontWeight: '700', color: '#e63946' },
  // Contact Row
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#003366' },
  contactName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  contactRole: { fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' },
  lastMessage: { fontSize: 13, color: '#64748b' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#003366' },
  // Chat
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  chatAvatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  chatAvatarText: { fontSize: 14, fontWeight: 'bold', color: '#003366' },
  chatHeaderName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  messagesList: { padding: 16, flexGrow: 1 },
  messageBubbleRow: { marginBottom: 12, alignItems: 'flex-start' },
  messageBubbleRowMine: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  myBubble: { backgroundColor: '#003366', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  messageText: { fontSize: 14, lineHeight: 20, color: '#1a1a1a' },
  messageTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'flex-end', gap: 8 },
  messageInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#e2e8f0' },
  sendButton: { backgroundColor: '#003366', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  emptyChatContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyChatText: { marginTop: 12, color: '#64748b', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: '35%' },
  emptyText: { marginTop: 16, color: '#64748b', fontSize: 18, fontWeight: '600' },
  emptySubtext: { marginTop: 8, color: '#94a3b8', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
