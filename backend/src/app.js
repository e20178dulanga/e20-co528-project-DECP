const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ── CORS ───────────────────────────────────────────────────────
// Allows: any localhost port (dev) + any *.vercel.app URL
const VERCEL_PATTERN = /\.vercel\.app$/;
const LOCALHOST_PATTERN = /^http:\/\/localhost(:\d+)?$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                    // server-to-server / Postman / native apps
    if (LOCALHOST_PATTERN.test(origin)) return cb(null, true);
    if (VERCEL_PATTERN.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', time: new Date() }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
