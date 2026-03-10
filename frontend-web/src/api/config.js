// API Base URLs — each backend service on its own port
export const AUTH_URL    = 'https://e20-co528-project-decp-backend.onrender.com/api';
export const FEED_URL    = 'https://e20-co528-project-decp-feed-service.onrender.com/api';
export const JOBS_URL    = 'https://e20-co528-project-decp-jobs-service.onrender.com/api';
export const EVENTS_URL  = 'https://e20-co528-project-decp-events-service.onrender.com/api';

// Helper: get stored JWT token
export const getToken = () => localStorage.getItem('decp_token');

// Helper: build Authorization header
export const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// Helper: format date
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Helper: first letter avatar
export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
