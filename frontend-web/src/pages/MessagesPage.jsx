import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, sendMessage } from '../api/messagesApi';
import { useAuth } from '../context/AuthContext';
import { initials } from '../api/config';

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeUser, setActiveUser] = useState(null);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);

  const { data: convos = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await getConversations()).data.conversations
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', activeUser?._id],
    queryFn: async () => (await getMessages(activeUser._id)).data.messages,
    enabled: !!activeUser,
    refetchInterval: 3000 // Polling for new messages every 3s
  });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', activeUser?._id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !activeUser) return;
    sendMutation.mutate({ receiverId: activeUser._id, content });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const contacts = convos.map(m => {
    const isSender = m.sender._id === currentUser._id;
    const otherUser = isSender ? m.receiver : m.sender;
    return {
      _id: otherUser._id,
      name: otherUser.name,
      lastMessage: m.content,
      read: isSender ? true : m.read
    };
  });

  return (
    <div className="page-wrapper wide" style={{ display: 'flex', gap: 20, height: 'calc(100vh - 100px)' }}>
      {/* Sidebar: Conversations */}
      <div className="card" style={{ width: 320, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ margin: 0 }}>Messages</h3>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {contacts.length === 0 ? (
             <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
               No recent conversations.
             </div>
          ) : (
            contacts.map(c => (
              <div key={c._id} onClick={() => setActiveUser({ _id: c._id, name: c.name })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: activeUser?._id === c._id ? 'var(--bg-card-hover)' : 'transparent',
                  transition: 'background 0.2s'
                }}>
                <div className="avatar">{initials(c.name)}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: !c.read ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: !c.read ? 600 : 400, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {c.lastMessage}
                  </div>
                </div>
                {!c.read && <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {activeUser ? (
          <>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
               <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{initials(activeUser.name)}</div>
               <h3 style={{ margin: 0, fontSize: 16 }}>{activeUser.name}</h3>
            </div>
            
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
              {isLoading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginTop: 'auto', marginBottom: 'auto' }}>Say hi to {activeUser.name}!</div>
              ) : (
                messages.map(m => {
                  const isMine = m.sender._id === currentUser._id;
                  return (
                    <div key={m._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <div style={{ background: isMine ? 'var(--accent)' : 'var(--bg-secondary)', color: isMine ? '#fff' : 'var(--text-primary)', padding: '10px 16px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, border: isMine ? 'none' : '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                <input type="text" className="form-group" style={{ flex: 1, margin: 0 }} placeholder="Type a message..." value={content} onChange={e => setContent(e.target.value)} />
                <button type="submit" className="btn btn-primary" disabled={!content.trim() || sendMutation.isPending}>Send</button>
              </form>
            </div>
          </>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
             <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
             <h3>Your Messages</h3>
             <p>Select a conversation to start chatting.</p>
           </div>
        )}
      </div>
    </div>
  );
}
