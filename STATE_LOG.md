# DECP — State Log

## Current Status: ✅ Phase 6 Complete — Ready for GitHub Push & Manual Deployment

---

## Active Services (Local)

| Service | Port | Status |
|---|---|---|
| Auth Service (`backend/`) | 5000 | ✅ Running |
| Feed Service (`feed-service/`) | 5001 | ✅ Running |
| Jobs Service (`jobs-service/`) | 5002 | ✅ Running |
| Events Service (`events-service/`) | 5003 | ✅ Running |
| Web Client (`frontend-web/`) | 5173 | ✅ Running |

---

## Phase 7 — Frontend Caching & UX Optimization (Completed 2026-03-18)

- **Objective:** Improve frontend UX by preventing unnecessary API refetching and loading spinners when navigating between tabs.
- **Implementation:** Integrated `@tanstack/react-query` into the React SPA in `main.jsx`, `FeedPage.jsx`, `JobsPage.jsx`, and `EventsPage.jsx`.
- **Current Status:** ✅ Completed. Pages now cache API results for 5 minutes and avoid re-fetch loading spinners.

---

## Phase 6 — Deployment Preparation (Completed 2026-03-17)

### Audit Results

All 4 backend services passed the production audit — **no code changes were required**:

| Check | Result |
|---|---|
| `process.env.PORT` in all `server.js` | ✅ Already correct |
| `process.env.MONGO_URI` in all `db.js` | ✅ Already correct |
| CORS reads `process.env.FRONTEND_URL` in all `app.js` | ✅ Already correct |
| `"start": "node server.js"` in all `package.json` | ✅ Already correct |
| Frontend uses `import.meta.env.VITE_*` in `api/config.js` | ✅ Already correct |
| No hardcoded `localhost` outside of config/fallback files | ✅ Confirmed |

### Files Updated During This Phase

| File | Change |
|---|---|
| `backend/.env.example` | Added `FRONTEND_URL`, improved comments |
| `feed-service/.env.example` | Added `FRONTEND_URL`, `JWT_EXPIRES_IN` |
| `jobs-service/.env.example` | Added `FRONTEND_URL`, `JWT_EXPIRES_IN` |
| `events-service/.env.example` | Added `FRONTEND_URL`, `JWT_EXPIRES_IN`, header comment |
| `frontend-web/.env.example` | **NEW** — template for all `VITE_*` variables |
| `README.md` | Added full **Deployment Preparation** section |
| `STATE_LOG.md` | This file — updated status |

### Deployment Strategy

```
MongoDB Atlas (Free M0) ──→ shared by all 4 services via MONGO_URI

Backend (4 services) ──→ Render.com free web services (manual GitHub import)
  ├── decp-auth-service     root dir: backend/
  ├── decp-feed-service     root dir: feed-service/
  ├── decp-jobs-service     root dir: jobs-service/
  └── decp-events-service   root dir: events-service/

Frontend ──→ Vercel (manual GitHub import)
  root dir: frontend-web/
```

---

## Environment Variables Checklist

### 🟠 Render.com — For EACH of the 4 backend services

| Variable | Notes |
|---|---|
| `NODE_ENV` | Set to `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | One long random string — **SAME VALUE** across all 4 services |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel URL (e.g. `https://decp-frontend.vercel.app`) |

> **Feed Service only** — additionally set `MAX_FILE_SIZE=10485760`

### 🟣 Vercel — Frontend

| Variable | Value (replace with actual Render URLs) |
|---|---|
| `VITE_AUTH_URL` | `https://decp-auth-service.onrender.com/api` |
| `VITE_FEED_URL` | `https://decp-feed-service.onrender.com/api` |
| `VITE_JOBS_URL` | `https://decp-jobs-service.onrender.com/api` |
| `VITE_EVENTS_URL` | `https://decp-events-service.onrender.com/api` |

---

## Next Steps

1. Push code to GitHub (`git push`)
2. Create MongoDB Atlas M0 cluster → get connection string
3. Deploy each service on Render.com (connect repo, set root dir, set env vars)
4. Deploy frontend on Vercel (connect repo, set root dir, set `VITE_*` env vars)
5. Update `FRONTEND_URL` on each Render service with actual Vercel URL

---

## Phase History

| Phase | Status | Date |
|---|---|---|
| Phase 1 — User Management (port 5000) | ✅ Confirmed | 2026-03-07 |
| Phase 2 — Feed & Media Posts (port 5001) | ✅ Confirmed | 2026-03-07 |
| Phase 3 — Jobs & Internships (port 5002) | ✅ Confirmed | 2026-03-07 |
| Phase 4 — Events & Announcements (port 5003) | ✅ Confirmed | 2026-03-07 |
| Phase 5 — Web Client (port 5173) | ✅ Confirmed | 2026-03-08 |
| Phase 6 — Cloud Deployment Preparation | ✅ Complete | 2026-03-17 |
