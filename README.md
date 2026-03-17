# Department Engagement & Career Platform (DECP)

> **University Mini-Project** — CO528 Applied Software Engineering

## Overview

DECP is a platform connecting students, alumni, and department admins via career events and community engagement tools. The backend follows a **Service-Oriented Architecture (SOA)** — each feature domain is an independent service with its own port.

### SOA Architecture

```
┌─────────────────────────────────────────┐
│               Client / Postman          │
└────────────┬──────────────┬─────────────┘
             │              │
    Auth Token issued   Bearer Token passed
             │              │
    ┌────────▼───┐   ┌──────▼──────────┐
    │   Auth     │   │  Feed Service   │
    │  Service   │   │   (port 5001)   │
    │ (port 5000)│   │                 │
    │  Users /   │   │  Posts/Comments │
    │  Auth JWT  │   │  Media Uploads  │
    └─────┬──────┘   └──────┬──────────┘
          │                 │
          └────────┬────────┘
                   │ Shared JWT_SECRET
                   │ (offline token verify)
          ┌────────▼────────┐
          │   MongoDB       │
          │ (localhost:27017)│
          │  DB: decp        │
          │  ├ users         │
          │  └ posts         │
          └─────────────────┘
```

> **SOA Key Point:** All services verify JWTs **locally** using the shared `JWT_SECRET`. No HTTP calls between services — stateless and fast.

---

## Tech Stack

| Layer | Technology | Used In |
|---|---|---|
| Runtime | Node.js 20 LTS | All services |
| Framework | Express.js | All services |
| Database | MongoDB (mongoose) | All services (shared DB) |
| Auth | JWT (jsonwebtoken) | All services |
| Password Hashing | bcryptjs | Auth Service |
| File Uploads | multer | Feed Service |
| Config | dotenv | All services |

---

## Project Structure

```
miniProject/
├── backend/                          ← Auth Service (port 5000)
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/User.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       └── userRoutes.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── feed-service/                     ← Feed Service (port 5001)
    ├── src/
    │   ├── config/db.js
    │   ├── models/
    │   │   ├── Post.js
    │   │   └── Comment.js
    │   ├── middleware/
    │   │   └── authMiddleware.js     # JWT verify (offline)
    │   ├── controllers/
    │   │   ├── postController.js
    │   │   └── commentController.js
    │   └── routes/
    │       ├── postRoutes.js
    │       └── commentRoutes.js
    ├── uploads/                      # Local media storage
    ├── server.js
    ├── .env.example
    └── package.json
jobs-service/                         ← Jobs Service (port 5002)
    ├── src/
    │   ├── config/db.js
    │   ├── models/
    │   │   ├── Job.js
    │   │   └── Application.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js     # JWT verify (offline)
    │   │   └── roleMiddleware.js     # Role guard factory
    │   ├── controllers/
    │   │   ├── jobController.js
    │   │   └── applicationController.js
    │   └── routes/
    │       ├── jobRoutes.js
    │       └── applicationRoutes.js
    ├── server.js
    ├── .env.example
    └── package.json
events-service/                       ← Events Service (port 5003)
    ├── src/
    │   ├── config/db.js
    │   ├── models/
    │   │   ├── Event.js
    │   │   ├── RSVP.js
    │   │   └── Notification.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   └── roleMiddleware.js
    │   ├── controllers/
    │   │   ├── eventController.js
    │   │   ├── rsvpController.js
    │   │   └── notificationController.js
    │   └── routes/
    │       ├── eventRoutes.js
    │       ├── rsvpRoutes.js
    │       └── notificationRoutes.js
    ├── server.js
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- [Node.js ≥ 18](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017`

---

## Getting Started

### Auth Service (port 5000)

```powershell
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\backend"
npm install
Copy-Item .env.example .env   # then edit JWT_SECRET
npm run dev
```

### Feed Service (port 5001)

```powershell
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\feed-service"
npm install
Copy-Item .env.example .env   # JWT_SECRET must match backend/.env
npm run dev
```

### Jobs Service (port 5002)

```powershell
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\jobs-service"
npm install
Copy-Item .env.example .env   # JWT_SECRET must match backend/.env
npm run dev
```

### Events Service (port 5003)

```powershell
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\events-service"
npm install
Copy-Item .env.example .env   # JWT_SECRET must match backend/.env
npm run dev
```

> ⚠️ **All four services can run simultaneously** — open four separate terminals.

### Web Client (port 5173)

```powershell
cd "d:\Academic UOP\Sem8\CO528_Applied_software\miniProject\frontend-web"
# dependencies already installed by Vite scaffolding
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> ⚠️ All four backend services **must** be running before starting the frontend.

---

## Environment Variables

### Auth Service (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | HTTP port |
| `MONGO_URI` | `mongodb://localhost:27017/decp` | MongoDB URI |
| `JWT_SECRET` | — | **Required.** Long random string |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |

### Feed Service (`feed-service/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5001` | HTTP port |
| `MONGO_URI` | `mongodb://localhost:27017/decp` | Same DB as Auth |
| `JWT_SECRET` | — | **Must match Auth Service value** |
| `MAX_FILE_SIZE` | `10485760` | Max upload size in bytes (10MB) |

---

## API Reference — Phase 1: User Management

### Auth Routes (`/api/auth`)

#### `POST /api/auth/register`

Create a new user account.

**Request body:**
```json
{
  "name": "Alice",
  "email": "alice@uni.ac.lk",
  "password": "Test@1234",
  "role": "student"
}
```
> `role` accepts `student` or `alumni`. Passing `admin` is silently downgraded to `student`.

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "name": "Alice", "email": "alice@uni.ac.lk", "role": "student", ... }
}
```

---

#### `POST /api/auth/login`

**Request body:**
```json
{
  "email": "alice@uni.ac.lk",
  "password": "Test@1234"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": { ... }
}
```

---

### User Routes (`/api/users`)  🔒 Requires JWT

All routes require `Authorization: Bearer <token>` header.

#### `GET /api/users/me`
Returns the authenticated user's profile.

#### `PUT /api/users/me`
Updates the authenticated user's profile.

**Updatable fields:** `name`, `bio`, `graduationYear`, `skills`, `linkedinUrl`, `profilePicture`

**Request body (any subset):**
```json
{
  "bio": "Final year CS student",
  "skills": ["JavaScript", "Python", "MongoDB"],
  "graduationYear": 2025,
  "linkedinUrl": "https://linkedin.com/in/alice"
}
```

#### `GET /api/users` 🛡️ Admin only
Returns all users.

#### `GET /api/users/:id` 🛡️ Admin only
Returns a single user by MongoDB ObjectId.

---

### Health Check

#### `GET /api/health`
```json
{ "status": "OK", "time": "2026-03-07T09:36:00.000Z" }
```

---

## Roles & Permissions

| Endpoint | student | alumni | admin |
|---|---|---|---|
| `POST /api/auth/register` | ✅ | ✅ | ✅ |
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `GET /api/users/me` | ✅ | ✅ | ✅ |
| `PUT /api/users/me` | ✅ | ✅ | ✅ |
| `GET /api/users` | ❌ | ❌ | ✅ |
| `GET /api/users/:id` | ❌ | ❌ | ✅ |

---

---

## API Reference — Phase 2: Feed & Media Posts

Base URL: `http://localhost:5001`  
All routes require `Authorization: Bearer <token>` (token from Auth Service login).

### Post Routes (`/api/posts`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts` | List posts (paginated: `?page=1&limit=20`) |
| `GET` | `/api/posts/:id` | Get single post |
| `POST` | `/api/posts` | Create text post |
| `POST` | `/api/posts/media` | Create post with image/video upload (`multipart/form-data`) |
| `PUT` | `/api/posts/:id` | Edit own post (text only) |
| `DELETE` | `/api/posts/:id` | Delete own post |
| `POST` | `/api/posts/:id/like` | Toggle like (idempotent) |
| `POST` | `/api/posts/:id/share` | Increment share count |

### Comment Routes (`/api/posts/:postId/comments`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/posts/:postId/comments` | Add comment |
| `GET` | `/api/posts/:postId/comments` | Get all comments |
| `DELETE` | `/api/posts/:postId/comments/:id` | Delete own comment |

### Media Files

Uploaded files are served at: `GET http://localhost:5001/uploads/<filename>`  
Allowed types: JPEG, PNG, GIF, WEBP, MP4, MOV. Max size: 10MB. Max 5 files per post.

---

## API Reference — Phase 3: Jobs & Internships

Base URL: `http://localhost:5002`  
All routes require `Authorization: Bearer <token>` (from Auth Service login).

### Job Routes (`/api/jobs`)

| Method | Path | Role Required | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Any | List open jobs (filter: `?type=internship`, `?open=false`) |
| `GET` | `/api/jobs/:id` | Any | Get single job |
| `POST` | `/api/jobs` | `alumni`, `admin` | Create job/internship posting |
| `PUT` | `/api/jobs/:id` | `alumni`, `admin` (own only) | Edit posting |
| `DELETE` | `/api/jobs/:id` | Own poster or `admin` | Delete posting |
| `PATCH` | `/api/jobs/:id/close` | Own poster | Close listing |

### Application Routes

| Method | Path | Role Required | Description |
|---|---|---|---|
| `POST` | `/api/jobs/:jobId/apply` | `student`, `alumni` | Apply (one per user per job) |
| `GET` | `/api/jobs/:jobId/applications` | Own poster, `admin` | View applications for a posting |
| `PATCH` | `/api/jobs/:jobId/applications/:id` | Own poster | Update status: `pending→reviewed→accepted/rejected` |
| `GET` | `/api/applications/mine` | Any | See your own submitted applications |

---

## API Reference — Phase 4: Events & Announcements

Base URL: `http://localhost:5003`  
All routes require `Authorization: Bearer <token>`.

### Event Routes (`/api/events`)

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/events` | Any | List events (filter: `?type=workshop&upcoming=true`) |
| `GET` | `/api/events/:id` | Any | Get single event |
| `POST` | `/api/events` | `admin`, `alumni` | Create event/workshop/announcement |
| `PUT` | `/api/events/:id` | Own organizer | Edit event |
| `DELETE` | `/api/events/:id` | Organizer or `admin` | Delete event |
| `PATCH` | `/api/events/:id/cancel` | Own organizer | Cancel & notify all RSVPers |

### RSVP Routes

| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/api/events/:id/rsvp` | Any | RSVP (blocked if full or announcement) |
| `DELETE` | `/api/events/:id/rsvp` | Any | Cancel own RSVP |
| `GET` | `/api/events/:id/attendees` | Organizer, `admin` | View attendee list |
| `GET` | `/api/rsvps/mine` | Any | See own RSVPs (with event details) |

### Notification Routes (`/api/notifications`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get own notifications (unread first, max 50) |
| `PATCH` | `/api/notifications/:id/read` | Mark one notification as read |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read |

**Notification types generated automatically:**
- `rsvp_received` — Organizer notified when someone RSVPs
- `event_cancelled` — All RSVPers notified when organizer cancels
- `new_event` — Past RSVPers of same organizer notified on new event

---

## Roadmap

- [x] **Phase 1** – User Management (Auth Service, port 5000)
- [x] **Phase 2** – Feed & Media Posts (Feed Service, port 5001)
- [x] **Phase 3** – Jobs & Internships (Jobs Service, port 5002)
- [x] **Phase 4** – Events & Announcements (Events Service, port 5003)
- [x] **Phase 5** – Web Client (React + Vite, port 5173)
- [x] **Phase 6** – Cloud Deployment Preparation (Render + Vercel)

---

## Deployment Preparation (Phase 6)

> **Strategy**: 4 backend microservices → [Render.com](https://render.com) free web services | Frontend → [Vercel](https://vercel.com) free hobby tier | Database → [MongoDB Atlas](https://cloud.mongodb.com) free M0 cluster.

### Architecture: Production

```
MongoDB Atlas (M0) ──→ shared by all 4 services via MONGO_URI env var

Backend (Render.com — 4 separate web services, each from its subfolder):
  ├── decp-auth-service     → backend/           (Start: node server.js)
  ├── decp-feed-service     → feed-service/       (Start: node server.js)
  ├── decp-jobs-service     → jobs-service/       (Start: node server.js)
  └── decp-events-service   → events-service/     (Start: node server.js)

Frontend (Vercel — from frontend-web/ subfolder):
  └── decp-frontend.vercel.app
```

### What Was Changed for Production

| File | Change |
|---|---|
| `backend/src/app.js` | CORS reads `FRONTEND_URL` from env; `localhost:5173` kept as fallback |
| `feed-service/src/app.js` | Same CORS pattern |
| `jobs-service/src/app.js` | Same CORS pattern |
| `events-service/src/app.js` | Same CORS pattern |
| `*/src/config/db.js` (all 4) | Uses `process.env.MONGO_URI` — no hardcoded localhost |
| `*/server.js` (all 4) | Uses `process.env.PORT` with local fallback |
| `*/package.json` (all 4) | `"start": "node server.js"` — Render auto-detects this |
| `frontend-web/src/api/config.js` | All base URLs use `import.meta.env.VITE_*` with localhost fallbacks |
| `frontend-web/vercel.json` | SPA rewrite rule: all paths serve `index.html` |
| `*/.env.example` (all 5) | Template env files updated with all production variables |

### Environment Variables Reference

#### Render.com — All 4 backend services (set per service)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string — **identical across all 4 services** |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel URL, e.g. `https://decp-frontend.vercel.app` |

> **Feed Service only** — also set `MAX_FILE_SIZE=10485760`

#### Vercel — Frontend

| Variable | Value |
|---|---|
| `VITE_AUTH_URL` | `https://decp-auth-service.onrender.com/api` |
| `VITE_FEED_URL` | `https://decp-feed-service.onrender.com/api` |
| `VITE_JOBS_URL` | `https://decp-jobs-service.onrender.com/api` |
| `VITE_EVENTS_URL` | `https://decp-events-service.onrender.com/api` |

> ⚠️ Replace the `onrender.com` subdomain placeholders with your actual Render service URLs after deployment.

### Deployment Steps (Manual — UI-based)

#### 1. MongoDB Atlas
1. Create a free **M0** cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a DB user with a strong password
3. Add `0.0.0.0/0` to the IP Allow List (Render uses dynamic IPs)
4. Copy the connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/decp?retryWrites=true&w=majority`

#### 2. Render.com (repeat for each of 4 services)
1. New → **Web Service** → connect your GitHub repo
2. **Root Directory**: set to the service subfolder (e.g. `backend`, `feed-service`, etc.)
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js` (auto-detected from `package.json`)
5. **Instance Type**: Free
6. Under **Environment** → add all variables from the table above

#### 3. Vercel (Frontend)
1. New Project → import your GitHub repo
2. **Root Directory**: `frontend-web`
3. **Framework**: Vite (auto-detected)
4. Under **Environment Variables** → add all `VITE_*` variables
5. Deploy

#### 4. Post-Deployment: Update CORS
After all 4 Render services are live, go back to each service's Environment settings and update `FRONTEND_URL` to your actual Vercel URL.
