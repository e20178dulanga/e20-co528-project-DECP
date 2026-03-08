const express = require('express');
const cors = require('cors');

const eventRoutes = require('./routes/eventRoutes');
const rsvpRoutes = require('./routes/rsvpRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/events', eventRoutes);
app.use('/api', rsvpRoutes);           // /api/events/:id/rsvp, /api/rsvps/mine
app.use('/api/notifications', notificationRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ service: 'events-service', status: 'OK', time: new Date() })
);

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
