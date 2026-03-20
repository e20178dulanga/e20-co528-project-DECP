const express = require('express');
const cors = require('cors');
const path = require('path');

const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// ── CORS ───────────────────────────────────────────────────────
// Allows: any localhost port (dev) + any *.vercel.app URL
const VERCEL_PATTERN = /\.vercel\.app$/;
const LOCALHOST_PATTERN = /^http:\/\/localhost(:\d+)?$/;
console.log('ℹ️  Feed Service CORS: allowing localhost:* + *.vercel.app');


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

// ── Serve uploaded files as static assets ────────────────────
// Files in /uploads are accessible via GET /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ service: 'feed-service', status: 'OK', time: new Date() })
);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  // Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
