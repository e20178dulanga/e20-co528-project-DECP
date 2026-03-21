const express = require('express');
const cors = require('cors');

const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────────────
// ── CORS ───────────────────────────────────────────────────────
// Allows: any localhost port (dev) + *.vercel.app + *.onrender.com
const VERCEL_PATTERN = /\.vercel\.app$/;
const RENDER_PATTERN = /\.onrender\.com$/;
const LOCALHOST_PATTERN = /^http:\/\/localhost(:\d+)?$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                    // server-to-server / Postman / native apps
    if (LOCALHOST_PATTERN.test(origin)) return cb(null, true);
    if (VERCEL_PATTERN.test(origin)) return cb(null, true);
    if (RENDER_PATTERN.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);   // /api/jobs/:jobId/apply, /api/applications/mine

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ service: 'jobs-service', status: 'OK', time: new Date() })
);

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
