# MBN DEV — Product Requirements Document

**Version:** 1.0  
**Date:** June 2026  
**Owner:** Mounir Banni (MBN DEV)

---

## 1. Overview

MBN DEV is a client-facing SaaS platform for a freelance web development studio. It replaces informal project management (email threads, spreadsheets, manual invoices) with a single branded portal where clients can request projects, track progress in real time, exchange messages, and submit payments — while the admin manages the full pipeline from one dashboard.

---

## 2. Problem Statement

Freelance developers lose significant time on coordination overhead: chasing clients for briefs, manually updating project status, collecting payments over WhatsApp, and answering "what stage is my project in?" questions. Clients, on the other hand, have no visibility into their project without sending a message.

**Goals:**
- Give clients a self-service portal: request → pay → track → communicate.
- Give the admin a single control plane: pipeline, financials, messaging, analytics.
- Eliminate manual status updates through real-time SSE push.

---

## 3. Users & Roles

| Role | Description |
|------|-------------|
| **Admin** | Mounir (platform owner). Full access to all data. Manages projects, orders, payments, clients, packages, and analytics. |
| **Client** | Verified buyer. Access limited to their own projects, orders, payments, messages, and settings. |

Authentication uses **JWT** (stored in localStorage) + a role cookie (`mbndev_auth`) for edge middleware SSR redirects. Tokens are invalidated on password change via `passwordChangedAt`.

---

## 4. Feature Scope

### 4.1 Public Website
- **Landing page** — hero, services overview, social proof, CTA to pricing/request.
- **Pricing page** — service packages with tier breakdown (Starter / Pro / Premium / Custom).
- **Services** — individual service detail pages (`/services/[slug]`).
- **Portfolio** — showcase of completed work.
- **About** — studio story and credentials.
- **Contact** — lead capture form.
- **Insights / Blog** — articles at `/insights/[slug]`.

### 4.2 Auth
- Signup, login, forgot-password, reset-password flow.
- JWT-based session with 401 → redirect to login.
- Role-based routing: `/dashboard/admin/*` and `/dashboard/client/*` enforced at both edge middleware and backend.

### 4.3 Project Request Flow
1. Client fills the multi-step request form at `/request`.
2. An **Order** is created in `pending` state.
3. Admin reviews and approves → order becomes payable.
4. Client submits payment at `/checkout/[orderId]`.
5. Admin verifies payment → **Project** is created, status moves to `in-progress`.

### 4.4 Project Lifecycle

```
pending → paid → in-progress → review → revision → completed | cancelled
```

Each transition fires a **system message** in the project chat and an SSE event to connected clients. The 5-stage `ProjectStageTracker` visualizes current position for the client.

### 4.5 Messaging
- Per-project threaded chat between admin and client.
- Messages stored with `senderId` (null = system) and `type` (`user | system`).
- System messages render as styled notification cards; content is `JSON.stringify({icon, title, body})`.
- Admin and client both have a unified `/messages` inbox page that lists all project threads.

### 4.6 Payments
- Manual verification flow: `pending → pending_verification → paid | failed`.
- Supported methods: CIH Bank transfer, PayPal, TapTapSend, Mock (dev/demo).
- Client uploads proof of payment; admin reviews and marks verified.
- Verified payment triggers `SM.paymentVerified` system message and a `Notification`.
- Invoices are generated and viewable at `/invoice/[id]`, shareable via `/share/[token]`.

### 4.7 Notifications
- Persisted `Notification` rows per user, pushed via SSE (`notification:new`).
- Admin sees notifications for all client activity; clients see their own.

### 4.8 Admin Dashboard
| Section | Capability |
|---------|-----------|
| **Overview** | KPI cards: revenue, active projects, pending orders, new clients |
| **Projects** | List + detail view; status transitions; milestone management; file uploads |
| **Orders** | Review incoming requests; approve/reject; link to project on payment |
| **Payments** | Verify proof of payment; mark paid/failed |
| **Clients** | View client profiles, admin notes (private), plan tier |
| **Packages** | CRUD service packages shown on the public pricing page |
| **Analytics** | Revenue charts, project stage distribution, client growth |
| **Messages** | All project threads in one place |
| **Leads** | CRM list of prospects imported from CSV or added manually |
| **Activity** | Audit log of admin actions |
| **Invoices** | Generate and share invoices |

### 4.9 Client Dashboard
| Section | Capability |
|---------|-----------|
| **Overview** | Active projects, recent payments, quick actions |
| **Projects** | Project list + detail with stage tracker, files, milestones |
| **Orders** | History of submitted requests |
| **Payments** | Payment history + submit new payment |
| **Messages** | All project threads |
| **Settings** | Profile, password change, plan info |

### 4.10 Real-Time (SSE)
- Single `EventSource` per session managed by `useRealtime` hook (singleton pattern).
- Events: `message:new`, `notification:new`, `project:updated`, `project:activity`.
- Auto-reconnect with exponential back-off + jitter.
- Server maintains `Map<userId, res[]>` with max 5 connections per user (oldest evicted).
- `__admin__` key for broadcast to all admins.

### 4.11 Leads CRM
- Admin can view, add, edit, and filter prospects.
- Leads can be imported from CSV.
- Fields: name, company, email, phone, source, status, notes.

### 4.12 Internationalization
- Three locales: English, French, Arabic.
- Arabic enables RTL layout via `LanguageContext`.
- Translation keys defined in `frontend/src/lib/i18n/en.ts` (canonical).

---

## 5. Architecture

### 5.1 Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Real-time | Server-Sent Events (in-process) |
| Email | Nodemailer |
| Deployment | Vercel (monorepo) |

### 5.2 Deployment

Both apps ship from a single repo via `vercel.json`:
- `/api/*` → Express serverless handler (`@vercel/node`)
- Everything else → Next.js (`@vercel/next`)

Frontend calls `/api/…` on its own origin — no absolute backend URL needed.

### 5.3 Data Model (Key Entities)

```
User          — id, email, role (admin|client), plan, passwordChangedAt, adminNotes
Order         — id, userId, packageId, status, brief
Project       — id, orderId, userId, status, milestones[], files[]
Message       — id, projectId, senderId (null=system), type, content
Payment       — id, orderId, method, status, proofUrl
Notification  — id, userId, type, read, payload
Lead          — id, name, company, email, phone, status, source, notes
Package       — id, name, tier, price, features[]
```

### 5.4 Security
- Helmet, HPP, CORS, rate limiting on all routes.
- `protect` middleware validates JWT on every protected route.
- `authorize(...roles)` gates admin routes.
- No `onDelete: Cascade` — manual deletion order enforced in code to avoid orphan data.

---

## 6. Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| **Performance** | API responses < 300 ms for common reads; SSE reconnect < 5 s |
| **Security** | OWASP Top 10 mitigated; JWT invalidated on password change |
| **Scalability** | SSE is single-instance; Redis pub/sub upgrade path documented |
| **Accessibility** | RTL support for Arabic; keyboard-navigable dashboard |
| **i18n** | EN / FR / AR at launch |
| **Uptime** | Vercel serverless — inherits platform SLA |

---

## 7. Out of Scope (v1)

- Stripe or automated payment processing (manual verification only).
- Multi-admin / team accounts.
- Client-side file uploads beyond project files (e.g., no general asset library).
- Mobile native app.
- Horizontal SSE scaling (single instance only).

---

## 8. Success Metrics

- Admin spends < 5 minutes processing a new payment verification.
- Clients can track their project status without sending a message to the admin.
- Zero unanswered project questions due to missed notifications.
- Time-from-request-to-project-start reduced vs. email-only workflow.

---

## 9. Future Roadmap (Post-v1)

- Automated payment via Stripe / CMI (Moroccan card processing).
- Client self-service revision requests with revision counter.
- Admin mobile app push notifications.
- Zapier / webhook integrations for CRM sync.
- White-label reseller mode.
- Redis-backed SSE for multi-instance deployment.
