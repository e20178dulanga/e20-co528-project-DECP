# DECP — State Log

## Current Status: ✅ Phase 5 Complete — Awaiting Local Test Confirmation

---

## Active Services

| Service | Port | Status |
|---|---|---|
| Auth Service (`backend/`) | 5000 | ✅ Running & confirmed |
| Feed Service (`feed-service/`) | 5001 | ✅ Running & confirmed |
| Jobs Service (`jobs-service/`) | 5002 | ✅ Running & confirmed |
| Events Service (`events-service/`) | 5003 | ✅ Running & confirmed |
| **Web Client** (`frontend-web/`) | **5173** | ✅ Built — pending test |

---

## Last Completed Step

**Phase 5: Web Client** — React + Vite frontend, all 4 backend services integrated. Dependencies: `axios`, `react-router-dom`.

### Files written (Phase 5)

| File | Purpose |
|---|---|
| `index.html` | Root HTML w/ Inter font + SEO meta tags |
| `src/index.css` | Full dark-theme design system (glassmorphism, gradients, utilities) |
| `src/main.jsx` | Entry with BrowserRouter + AuthProvider |
| `src/App.jsx` | Route definitions + ProtectedRoute wrapper |
| `src/api/config.js` | All 4 service base URLs + helpers |
| `src/api/authApi.js` | Auth service calls (port 5000) |
| `src/api/feedApi.js` | Feed service calls (port 5001) |
| `src/api/jobsApi.js` | Jobs service calls (port 5002) |
| `src/api/eventsApi.js` | Events service calls (port 5003) |
| `src/context/AuthContext.jsx` | JWT context — persists token, loads user on mount |
| `src/components/Navbar.jsx` | Sticky glassmorphism nav w/ role display, sign-out |
| `src/components/ProtectedRoute.jsx` | Route guard → /login redirect |
| `src/pages/LoginPage.jsx` | Login with glassmorphism card |
| `src/pages/RegisterPage.jsx` | Register with role selector |
| `src/pages/FeedPage.jsx` | Feed: create/view posts, likes, comments, media |
| `src/pages/JobsPage.jsx` | Jobs: list, filter type, apply modal, post modal |
| `src/pages/EventsPage.jsx` | Events: list, filter type, RSVP, notifications dropdown |

---

## Commands to Start Everything

```powershell
# Terminal 1
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\backend" && npm run dev

# Terminal 2
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\feed-service" && npm run dev

# Terminal 3
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\jobs-service" && npm run dev

# Terminal 4
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\events-service" && npm run dev

# Terminal 5 — Web Client
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\frontend-web"
npm run dev
# Open http://localhost:5173
```

---

## Test Flow (Phase 5)

1. Open http://localhost:5173 → Register as a student
2. Login → lands on Feed page
3. Create a text post → confirm it appears in the feed
4. Navigate to Jobs → view listings, apply for one
5. Navigate to Events → RSVP to an event
6. Check 🔔 notification bell → see rsvp_received (as alumni) or new_event

---

## Next Step (After Test Confirmation)

> **BLOCKED** — Awaiting user confirmation.

Once confirmed: **Phase 6 — Cloud Deployment / Docker Compose**

---

## Phase History

| Phase | Status | Date |
|---|---|---|
| Phase 1 — User Management (port 5000) | ✅ Confirmed | 2026-03-07 |
| Phase 2 — Feed & Media Posts (port 5001) | ✅ Confirmed | 2026-03-07 |
| Phase 3 — Jobs & Internships (port 5002) | ✅ Confirmed | 2026-03-07 |
| Phase 4 — Events & Announcements (port 5003) | ✅ Confirmed | 2026-03-07 |
| Phase 5 — Web Client (port 5173) | ✅ Built, pending test | 2026-03-08 |
| Phase 6 — Deployment | ⏳ Not started | — |
