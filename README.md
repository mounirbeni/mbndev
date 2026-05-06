# MBN DEV — SaaS Platform

A full-stack SaaS platform for a freelance web developer by **Mounir Banni**.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT (RS256-compatible) |
| Payments | Stripe (checkout sessions) |
| File Upload | Multer |

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET
npm install
npm run seed               # creates admin + demo client + packages
npm run dev                # http://localhost:5000
```

**Demo accounts (after seeding):**
- Admin: `admin@mbndev.com` / `admin123`
- Client: `client@demo.com` / `client123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

---

## Project Structure

```
mbndev/
├── backend/
│   └── src/
│       ├── config/        MongoDB connection
│       ├── controllers/   auth, projects, messages, payments, packages
│       ├── middleware/     JWT auth guard, role guard, multer upload
│       ├── models/         User, Project, Message, Payment, Package
│       └── routes/         /api/auth, /api/projects, /api/messages, ...
└── frontend/
    └── src/
        ├── app/           Pages (landing, auth, dashboards, request)
        ├── components/    UI, landing, dashboard components
        ├── contexts/      AuthContext (JWT + roles)
        └── lib/           API client, utils
```

---

## Features

- **Landing Page** — hero, services, portfolio, pricing, process, testimonials, CTA
- **JWT Auth** — register/login, admin/client roles
- **Client Dashboard** — projects overview, messaging, payments
- **Admin Dashboard** — manage all projects, update status/progress, clients, packages, payments
- **Multi-Step Project Request** — 5-step smart form
- **Messaging** — per-project real-time-ready threaded chat
- **Stripe-Ready Payments** — checkout sessions + webhook handler
- **File Uploads** — deliverable uploads with Multer

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (`vercel deploy`) |
| Backend | Railway / Render / Fly.io |
| Database | MongoDB Atlas |
| Files | Cloudinary (recommended upgrade from local Multer) |

---

## Bonus — Scalability Ideas

1. **AI Project Suggestions** — use Claude API to analyze client description and suggest features/budget
2. **WebSocket Chat** — replace polling with Socket.io for real-time messaging
3. **Cloudinary CDN** — replace Multer disk storage with Cloudinary for file uploads
4. **Email Notifications** — Resend/SendGrid for project status updates
5. **Multi-currency** — Stripe supports MAD, EUR, USD natively
