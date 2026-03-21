import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingUsers, getAllUsersAdmin, approveUser, rejectUser } from '../api/adminApi';
import { initials } from '../api/config';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('pending');

  const { data: pendingUsers = [], isLoading: loadingPending } = useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: async () => (await getPendingUsers()).data.users,
    enabled: tab === 'pending',
  });

  const { data: allUsers = [], isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await getAllUsersAdmin()).data.users,
    enabled: tab === 'all',
  });

  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const handleApprove = (id, name) => {
    if (window.confirm(`Approve ${name}?`)) approveMutation.mutate(id);
  };

  const handleReject = (id, name) => {
    if (window.confirm(`Reject ${name}? They won't be able to log in.`)) rejectMutation.mutate(id);
  };

  const statusColor = (s) => {
    if (s === 'approved') return '#22c55e';
    if (s === 'rejected') return '#ef4444';
    return '#f59e0b';
  };

  const users = tab === 'pending' ? pendingUsers : allUsers;
  const isLoading = tab === 'pending' ? loadingPending : loadingAll;

  return (
    <div className="page-wrapper wide">
      <div className="page-header">
        <h2>Admin Panel</h2>
        <p>Manage user registrations and approvals.</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          className={`btn ${tab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('pending')}
        >
          Pending Registrations
        </button>
        <button
          className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('all')}
        >
          All Users
        </button>
      </div>

      {isLoading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          {tab === 'pending' ? '🎉 No pending registrations! All users have been reviewed.' : 'No users found.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.map(u => (
            <div key={u._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px' }}>
              {/* Avatar */}
              <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                {initials(u.name)}
              </div>

              {/* User Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</div>
              </div>

              {/* Role */}
              <div style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-muted)', fontWeight: 500, minWidth: 60 }}>
                {u.role}
              </div>

              {/* Status Badge */}
              <span style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                color: statusColor(u.status), backgroundColor: statusColor(u.status) + '18',
                border: `1px solid ${statusColor(u.status)}40`,
              }}>
                {(u.status || 'pending').toUpperCase()}
              </span>

              {/* Date */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
              </div>

              {/* Actions */}
              {u.status !== 'approved' && u.role !== 'admin' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: 12, backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                    onClick={() => handleApprove(u._id, u.name)}
                    disabled={approveMutation.isPending}
                  >
                    ✓ Approve
                  </button>
                  {u.status !== 'rejected' && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12, backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => handleReject(u._id, u.name)}
                      disabled={rejectMutation.isPending}
                    >
                      ✕ Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
