import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPosts, createPost, createMediaPost, likePost, sharePost, getComments, addComment, deletePost } from '../api/feedApi';
import { initials, fmtDate, FEED_URL } from '../api/config';

function PostCard({ post, currentUserId, onLike, onShare, onDelete }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const loadComments = async () => {
    if (!showComments) {
      const res = await getComments(post._id);
      setComments(res.data.comments);
    }
    setShowComments(v => !v);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      const res = await addComment(post._id, { content: newComment });
      setComments(c => [...c, res.data.comment]);
      setNewComment('');
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoadingComment(false); }
  };

  const liked = post.likes?.includes(currentUserId);

  return (
    <div className="card post-card">
      <div className="post-meta">
        <div className="avatar">{initials(post.authorName)}</div>
        <div>
          <div className="post-author">{post.authorName || 'User'}</div>
          <div className="post-time">{fmtDate(post.createdAt)}</div>
        </div>
        {post.author === currentUserId && (
          <button onClick={() => onDelete(post._id)} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>✕</button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      {post.mediaFiles?.length > 0 && (
        <div className="post-media">
          {post.mediaFiles.map((m, i) =>
            m.type === 'image'
              ? <img key={i} src={`https://e20-co528-project-decp-feed-service.onrender.com${m.url}`} alt="post media" />
              : <video key={i} controls src={`https://e20-co528-project-decp-feed-service.onrender.com${m.url}`} />
          )}
        </div>
      )}

      <div className="post-actions">
        <button onClick={() => onLike(post._id)} className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-secondary'}`}>
          ❤️ {post.likes?.length || 0}
        </button>
        <button onClick={loadComments} className="btn btn-secondary btn-sm">
          💬 {post.commentCount || 0}
        </button>
        <button onClick={() => onShare(post._id)} className="btn btn-secondary btn-sm">
          🔗 {post.shares || 0}
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          {comments.map(c => (
            <div key={c._id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initials(c.authorName)}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.authorName} </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.content}</span>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input className="form-group" style={{ flex: 1, padding: '7px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13 }}
              placeholder="Write a comment…" value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loadingComment}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const load = async () => {
    try { const res = await getPosts(); setPosts(res.data.posts); }
    catch { setError('Could not load posts. Is the Feed Service running?'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;
    setSubmitting(true); setError('');
    try {
      let res;
      if (mediaFiles.length > 0) {
        const fd = new FormData();
        fd.append('content', content);
        mediaFiles.forEach(f => fd.append('media', f));
        res = await createMediaPost(fd);
      } else {
        res = await createPost({ content });
      }
      setPosts(p => [res.data.post, ...p]);
      setContent(''); setMediaFiles([]); if (fileRef.current) fileRef.current.value = '';
    } catch (err) { setError(err.response?.data?.message || 'Failed to post.'); }
    finally { setSubmitting(false); }
  };

  const handleLike = async (id) => {
    try {
      const res = await likePost(id);
      setPosts(p => p.map(post => post._id === id ? { ...post, likes: res.data.post.likes } : post));
    } catch { }
  };

  const handleShare = async (id) => {
    try {
      const res = await sharePost(id);
      setPosts(p => p.map(post => post._id === id ? { ...post, shares: res.data.shares } : post));
    } catch { }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try { await deletePost(id); setPosts(p => p.filter(post => post._id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>🏠 Community Feed</h2>
        <p>Share updates, achievements, and connect with your department.</p>
      </div>

      {/* Create Post */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handlePost}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div className="avatar">{initials(user.name)}</div>
            <div style={{ flex: 1 }}>
              <textarea
                placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
                value={content} onChange={e => setContent(e.target.value)}
                style={{ width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', resize: 'vertical', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <label style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📎 {mediaFiles.length > 0 ? `${mediaFiles.length} file(s)` : 'Attach media'}
                  <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
                    onChange={e => setMediaFiles(Array.from(e.target.files))} />
                </label>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} style={{ marginLeft: 'auto' }}>
                  {submitting ? 'Posting…' : '✨ Post'}
                </button>
              </div>
              {error && <div className="alert alert-error" style={{ marginTop: 8 }}>{error}</div>}
            </div>
          </div>
        </form>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span>Loading posts…</span></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📭</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something with the community!</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post._id} post={post} currentUserId={user._id}
            onLike={handleLike} onShare={handleShare} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
