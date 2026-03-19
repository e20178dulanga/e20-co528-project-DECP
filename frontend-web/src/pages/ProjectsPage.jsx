import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, addCollaborator, uploadDocuments } from '../api/projectsApi';
import { searchUsers } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';

function AddCollaboratorForm({ projectId, onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if(!query.trim()) return;
    try {
      const res = await searchUsers(query);
      // Filter out existing potential collaborators visually if needed, but backend handles deduping anyway
      setResults(res.data.users);
    } catch(err) { }
  };

  return (
    <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
        <input type="text" className="form-group" style={{ margin: 0, flex: 1, padding: '6px 10px', fontSize: 13 }} placeholder="Search user to add..." value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>Search</button>
      </form>
      {results.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {results.map(u => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13 }}><strong>{u.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({u.role})</span></span>
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => { onAdd({ projectId, userId: u._id, userName: u.name }); setResults([]); setQuery(''); }}>Add</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await getProjects()).data.projects
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setTitle('');
      setDescription('');
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, formData }) => uploadDocuments(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });

  const collabMutation = useMutation({
    mutationFn: ({ projectId, userId, userName }) => addCollaborator(projectId, { userId, userName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ title, description });
  };

  const handleFileUpload = (e, projectId) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    uploadMutation.mutate({ id: projectId, formData });
  };

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper wide">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>🔬 Research Collaboration</h2>
          <p>Manage projects, share documents, and work together.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Create New Project</h3>
          <form onSubmit={handleCreate}>
            <input type="text" className="form-group" style={{ marginBottom: 12 }} placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea className="form-group" style={{ marginBottom: 12 }} placeholder="Project Description" value={description} onChange={e => setDescription(e.target.value)} required rows={3}></textarea>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>Create Project</button>
          </form>
        </div>
      )}

      <div className="grid-2">
        {projects.length === 0 && !showCreate && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            No projects found. Create one to start collaborating!
          </div>
        )}
        {projects.map(p => (
          <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{p.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{p.description}</p>
            <div style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-primary)' }}>
              <strong>Owner:</strong> {p.ownerName}
            </div>
            <div style={{ fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>
              <strong>Collaborators:</strong> {p.collaborators.length > 0 ? p.collaborators.map(c => c.name).join(', ') : 'None'}
              {p.owner === user._id && (
                <AddCollaboratorForm projectId={p._id} onAdd={(data) => collabMutation.mutate(data)} />
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>📄 Documents ({p.documents.length})</h4>
              {p.documents.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {p.documents.map(d => (
                    <li key={d._id} style={{ fontSize: 13 }}>
                      <a href={d.url} download={d.filename} style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 500 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        {d.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              
              <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontSize: 13, padding: '6px 14px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                {uploadMutation.isPending && uploadMutation.variables?.id === p._id ? 'Uploading...' : 'Upload Files'}
                <input type="file" multiple onChange={(e) => handleFileUpload(e, p._id)} style={{ display: 'none' }} disabled={uploadMutation.isPending} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
