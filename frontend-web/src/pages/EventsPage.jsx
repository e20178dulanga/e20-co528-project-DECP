import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getEvents, createEvent, rsvpEvent, cancelRsvp, getMyRsvps, getNotifications, markAllRead } from '../api/eventsApi';
import { fmtDate } from '../api/config';

function CreateEventModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', type: 'event', description: '', location: 'Online', startDate: '', endDate: '', capacity: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await createEvent(form); onSuccess(); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to create event.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Event</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="CS Career Workshop" /></div>
          <div className="form-group"><label>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="event">Event</option>
              <option value="workshop">Workshop</option>
              <option value="announcement">Announcement</option>
            </select></div>
          <div className="form-group"><label>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
          <div className="form-group"><label>Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Hall A or Online" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label>Start Date</label>
              <input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
            <div className="form-group"><label>Capacity (0=unlimited)</label>
              <input type="number" min={0} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : '📅 Create Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TYPE_BADGE = { event: 'badge-purple', workshop: 'badge-cyan', announcement: 'badge-yellow' };
const TYPE_EMOJI = { event: '🎉', workshop: '🛠️', announcement: '📢' };

export default function EventsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const canCreate = user.role === 'admin' || user.role === 'alumni';

  const { data: { events = [], myRsvpIds = [], notifications = [] } = {}, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['events', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? `type=${filter}&upcoming=true` : 'upcoming=true';
      const [evRes, rsvpRes, notifRes] = await Promise.all([
        getEvents(params), getMyRsvps(), getNotifications()
      ]);
      return {
        events: evRes.data.events,
        myRsvpIds: rsvpRes.data.rsvps.map(r => r.event?._id || r.event),
        notifications: notifRes.data.notifications
      };
    }
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, isRsvped }) => {
      if (isRsvped) await cancelRsvp(eventId);
      else await rsvpEvent(eventId);
      return { eventId, isRsvped };
    },
    onSuccess: ({ eventId, isRsvped }) => {
      queryClient.setQueryData(['events', filter], old => {
        if (!old) return old;
        const newIds = isRsvped ? old.myRsvpIds.filter(id => id !== eventId) : [...old.myRsvpIds, eventId];
        const newEvents = old.events.map(e => e._id === eventId ? { ...e, rsvpCount: e.rsvpCount + (isRsvped ? -1 : 1) } : e);
        return { ...old, myRsvpIds: newIds, events: newEvents };
      });
      if (!isRsvped) {
        setSuccessMsg('RSVP confirmed! 🎉');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    },
    onError: (err) => alert(err.response?.data?.message || 'Action failed.')
  });

  const handleRsvp = (eventId, isRsvped) => rsvpMutation.mutate({ eventId, isRsvped });

  const markReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(['events', filter], old => {
        if (!old) return old;
        return { ...old, notifications: old.notifications.map(n => ({ ...n, isRead: true })) };
      });
    }
  });
  const handleMarkAllRead = () => markReadMutation.mutate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-wrapper wide">
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSuccess={refetch} />}

      <div className="flex-between page-header">
        <div>
          <h2>Events & Announcements</h2>
          <p>Upcoming workshops, events, and department announcements.</p>
        </div>
        <div className="flex-gap">
          {/* Notifications bell */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowNotifs(v => !v)}>
              🔔 {unreadCount > 0 && <span style={{ background: 'var(--error)', borderRadius: '100px', padding: '0 5px', fontSize: 11 }}>{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div style={{ position: 'absolute', right: 0, top: '110%', width: 320, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', zIndex: 50, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div className="flex-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                  {unreadCount > 0 && <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">Mark all read</button>}
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 13 }}>No notifications</p>
                  ) : notifications.map(n => (
                    <div key={n._id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: n.isRead ? 'transparent' : 'var(--accent-dim)', fontSize: 13 }}>
                      <p style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{fmtDate(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {canCreate && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Event</button>}
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {isError && <div className="alert alert-error">Could not load events. Is the Events Service running?</div>}

      {/* Filters */}
      <div className="flex-gap" style={{ marginBottom: 20 }}>
        {['all', 'event', 'workshop', 'announcement'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
            {f === 'all' ? 'All' : f === 'event' ? 'Events' : f === 'workshop' ? 'Workshops' : 'Announcements'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span>Loading events…</span></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📭</div>
          <h3>No upcoming events</h3>
          <p>{canCreate ? 'Create the first one!' : 'Check back soon for upcoming events.'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {events.map(ev => {
            const isRsvped = myRsvpIds.includes(ev._id);
            const isFull = ev.capacity > 0 && ev.rsvpCount >= ev.capacity;
            const isAnnouncement = ev.type === 'announcement';
            return (
              <div key={ev._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <span className={`badge ${TYPE_BADGE[ev.type]}`}>{TYPE_EMOJI[ev.type]} {ev.type}</span>
                  {ev.capacity > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ev.rsvpCount}/{ev.capacity} attending</span>}
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>{ev.title}</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {ev.location}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🗓 {fmtDate(ev.startDate)}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', flexGrow: 1 }}>
                  {ev.description.slice(0, 140)}{ev.description.length > 140 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flexGrow: 1 }}>by {ev.organizerName}</span>
                  {!isAnnouncement && (
                    isRsvped
                      ? <button onClick={() => handleRsvp(ev._id, true)} className="btn btn-danger btn-sm">✗ Cancel RSVP</button>
                      : <button onClick={() => handleRsvp(ev._id, false)} className="btn btn-success btn-sm" disabled={isFull}>
                        {isFull ? 'Full' : '✓ RSVP'}
                      </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
