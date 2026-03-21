import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiEvents } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await apiEvents.get('/events?upcoming=true');
      setEvents(response.data.events || response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId, hasRsvped) => {
    try {
      if (hasRsvped) {
        await apiEvents.delete(`/events/${eventId}/rsvp`);
        Alert.alert('RSVP Cancelled', 'You have successfully cancelled your RSVP.');
      } else {
        await apiEvents.post(`/events/${eventId}/rsvp`);
        Alert.alert('Success', 'Your RSVP is confirmed!');
      }
      fetchEvents();
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      Alert.alert('Error', msg);
    }
  };

  const renderItem = ({ item }) => {
    const hasRsvped = false; // Note: for a real app, bind this to the authentic user's RSVP status returned by the API

    const eventDate = item.startDate ? new Date(item.startDate) : null;
    const dateFormatted = eventDate && !isNaN(eventDate) ? eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' }) : 'Date TBD';
    const timeFormatted = eventDate && !isNaN(eventDate) ? eventDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.eventBadge}>
            <Text style={styles.eventType}>{item.type?.toUpperCase() || 'EVENT'}</Text>
          </View>
        </View>
        
        <View style={styles.infoRowContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#e63946" />
            <Text style={styles.infoText}>{dateFormatted}{timeFormatted ? ` at ${timeFormatted}` : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#003366" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.capacityContainer}>
            <Ionicons name="people-outline" size={18} color="#64748b" />
            <Text style={styles.capacityText}>
              <Text style={styles.capacityHighlight}>{item.attendees?.length || 0}</Text> / {item.capacity || '∞'} Attending
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.rsvpButton, hasRsvped && styles.rsvpButtonCancel]} 
            onPress={() => handleRSVP(item._id, hasRsvped)}
            activeOpacity={0.8}
          >
            <Text style={styles.rsvpButtonText}>{hasRsvped ? 'Cancel RSVP' : 'RSVP Now'}</Text>
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
          data={events}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No upcoming events.</Text>
              <Text style={styles.emptySubtext}>We'll let you know when new events are scheduled.</Text>
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
  eventCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20, 
    elevation: 3, 
    shadowColor: '#003366', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8 
  },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  eventTitle: { fontSize: 19, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 12, lineHeight: 26 },
  eventBadge: { 
    backgroundColor: '#fff1f2', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe4e6'
  },
  eventType: { fontSize: 11, fontWeight: '700', color: '#e63946', letterSpacing: 0.5 },
  infoRowContainer: { marginBottom: 16, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, fontWeight: '600', color: '#334155', marginLeft: 8 },
  description: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 20 },
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
  capacityContainer: { flexDirection: 'row', alignItems: 'center' },
  capacityText: { fontSize: 14, color: '#64748b', marginLeft: 8, fontWeight: '500' },
  capacityHighlight: { color: '#003366', fontWeight: '700' },
  rsvpButton: { 
    backgroundColor: '#003366', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  rsvpButtonCancel: { backgroundColor: '#ef4444' },
  rsvpButtonText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  emptyContainer: { alignItems: 'center', marginTop: '40%' },
  emptyText: { marginTop: 16, color: '#64748b', fontSize: 18, fontWeight: '600' },
  emptySubtext: { marginTop: 8, color: '#94a3b8', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
});
