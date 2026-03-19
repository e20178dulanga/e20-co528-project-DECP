import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../api/config';

const NAV_LINKS = [
  { to: '/feed',   label: '🏠 Feed' },
  { to: '/jobs',   label: '💼 Jobs' },
  { to: '/events', label: '📅 Events' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(224, 242, 254, 0.9)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)', height: 'var(--nav-height)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
    }}>
      {/* Logo */}
      <NavLink to="/feed" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
        <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DECP</span>
      </NavLink>

      {/* Nav links — desktop */}
      <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center', marginRight: '48px' }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
              color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
            })}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'none' }}
          className="role-badge">{user.role}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
            {initials(user.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user.name}</span>
            <span style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginLeft: 4 }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
