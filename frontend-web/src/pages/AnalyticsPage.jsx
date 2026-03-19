import { useQuery } from '@tanstack/react-query';
import { getUserStats, getPostStats, getJobStats } from '../api/analyticsApi';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['analyticsStats'],
    queryFn: async () => {
      const [uRes, pRes, jRes] = await Promise.all([
        getUserStats(),
        getPostStats(),
        getJobStats()
      ]);
      return {
        users: uRes.data,
        posts: pRes.data,
        jobs: jRes.data
      };
    }
  });

  if (user?.role !== 'admin' && user?.role !== 'alumni') {
    return <div className="page-wrapper"><div className="alert alert-error">Access Denied: Admin or Alumni only.</div></div>;
  }

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /><span>Loading analytics…</span></div>;
  if (isError) return <div className="page-wrapper"><div className="alert alert-error">Failed to load analytics mapping. Please wait until servers start.</div></div>;

  return (
    <div className="page-wrapper wide">
      <div className="page-header">
        <h2>📈 Analytics Dashboard</h2>
        <p>Platform overview and engagement metrics.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)' }}>Users</h3>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{stats.users.totalUsers}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats.users.students} Students • {stats.users.alumni} Alumni</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)' }}>Content</h3>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{stats.posts.totalPosts}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Posts Created</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)' }}>Jobs</h3>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{stats.jobs.totalJobs}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats.jobs.openJobs} Open Opportunities</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 16 }}>🔥 Top Posts by Likes</h3>
          {stats.posts.topPosts.map(p => (
            <div key={p._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14 }}>{p.content}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>By {p.authorName} • ❤️ {p.likeCount}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 16 }}>💼 Most Applied Jobs</h3>
          {stats.jobs.popularJobs.map(j => (
            <div key={j._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{j.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{j.company} • 👥 {j.applicationCount} Applications</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
