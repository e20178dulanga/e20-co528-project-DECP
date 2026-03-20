import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getJobs, createJob, applyForJob, getMyApplications } from '../api/jobsApi';
import { fmtDate } from '../api/config';

function ApplyModal({ job, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const formData = new FormData();
      if (coverLetter) formData.append('coverLetter', coverLetter);
      if (cvFile) formData.append('cv', cvFile);

      await applyForJob(job._id, formData);
      onSuccess();
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Application failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Apply for: {job.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {job.company} · {job.location}
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>CV / Resume (optional)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label>Cover Letter (optional)</label>
            <textarea placeholder="Tell us why you're a great fit…" value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)} style={{ minHeight: 120 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', company: '', type: 'internship', location: 'Colombo', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await createJob(form);
      onSuccess(); onClose();
    } catch (err) { setError(err.response?.data?.message || 'Failed to post job.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Post a Job / Internship</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['title', 'Job Title', 'Software Engineer'], ['company', 'Company', 'TechCorp LK'], ['location', 'Location', 'Colombo']].map(([k, l, p]) => (
            <div key={k} className="form-group">
              <label>{l}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} required />
            </div>
          ))}
          <div className="form-group">
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="internship">Internship</option>
              <option value="job">Full-time Job</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Application Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [applyJob, setApplyJob] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const canPost = user.role === 'alumni' || user.role === 'admin';

  const { data: { jobs = [], myApps = [] } = {}, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['jobs', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? `type=${filter}` : '';
      const [jobsRes, appsRes] = await Promise.all([getJobs(params), getMyApplications()]);
      return {
        jobs: jobsRes.data.jobs,
        myApps: appsRes.data.applications.map(a => a.job._id)
      };
    }
  });

  const handleApplySuccess = () => {
    setSuccessMsg('Application submitted!');
    refetch();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="page-wrapper wide">
      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} onSuccess={handleApplySuccess} />}
      {showPostModal && <PostJobModal onClose={() => setShowPostModal(false)} onSuccess={refetch} />}

      <div className="flex-between page-header">
        <div>
          <h2>Jobs & Internships</h2>
          <p>Opportunities posted by alumni and department staff.</p>
        </div>
        {canPost && (
          <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>+ Post Opportunity</button>
        )}
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {isError && <div className="alert alert-error">Could not load jobs. Is the Jobs Service running?</div>}

      {/* Filters */}
      <div className="flex-gap" style={{ marginBottom: 20 }}>
        {['all', 'job', 'internship'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
            {f === 'all' ? 'All' : f === 'job' ? 'Jobs' : 'Internships'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span>Loading listings…</span></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          <h3>No listings found</h3>
          <p>{canPost ? 'Be the first to post an opportunity!' : 'Check back soon.'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {jobs.map(job => {
            const applied = myApps.includes(job._id);
            const isOwn = job.poster === user._id;
            return (
              <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <span className={`badge ${job.type === 'internship' ? 'badge-cyan' : 'badge-purple'}`}>
                    {job.type}
                  </span>
                  {!job.isOpen && <span className="badge badge-red">Closed</span>}
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 4 }}>{job.title}</h3>
                <p style={{ color: 'var(--accent-2)', fontWeight: 600, fontSize: 14 }}>{job.company}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>📍 {job.location}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, flexGrow: 1 }}>
                  {job.description.slice(0, 120)}{job.description.length > 120 ? '…' : ''}
                </p>
                {job.deadline && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    ⏰ Deadline: {fmtDate(job.deadline)}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flexGrow: 1 }}>
                    {job.applicationCount} applied · by {job.posterName}
                  </span>
                  {!isOwn && job.isOpen && (
                    applied
                      ? <span className="badge badge-green">✓ Applied</span>
                      : <button className="btn btn-primary btn-sm" onClick={() => setApplyJob(job)}>Apply Now</button>
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
