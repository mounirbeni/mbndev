# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start dev server with nodemon on :5000
npm start            # Production start
npm run seed         # Seed DB with admin + demo client + packages
npm test             # Node built-in test runner (tests/*.test.js) — no DB needed
npm run db:push      # Push Prisma schema changes to DB (no migration file)
npm run db:generate  # Regenerate Prisma client after schema edit
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Start Next.js dev server on :3000
npm run build        # Production build (runs TypeScript type-check)
npm run lint         # ESLint
```

### Schema migrations
Schema changes that can't be handled by `db:push` (e.g. adding a nullable column to a live table) are done via one-off migration scripts in `backend/prisma/migrate*.js`. Run them directly with `node backend/prisma/migrateN.js`.

### Demo credentials (after seeding)
- Admin: `admin@mbndev.com` / `admin123`
- Client: `client@demo.com` / `client123`

---

## Architecture

### Deployment topology
Both apps are deployed together on **Vercel** via `vercel.json` at the repo root. `/api/*` rewrites to the Express server (`@vercel/node`); everything else serves the Next.js frontend (`@vercel/next`). The frontend calls its own origin at `/api/…` — no absolute backend URL is needed.

### Backend (`backend/src/`)

**Stack:** Express + Prisma (PostgreSQL). No MongoDB despite the README — the codebase was migrated.

- `server.js` — Entry point. Registers middleware (helmet, CORS, HPP, rate limiting, pino logger), mounts all routes, global error handler. In production (Vercel serverless) the `app.listen()` block is skipped; the module export is the handler.
- `lib/prisma.js` — Singleton Prisma client.
- `lib/realtime.js` — **Server-Sent Events** bus. In-process `Map<userId, res[]>` with a special `__admin__` broadcast key. `publishToUser`, `publishToAdmins`, `publishToUserAndAdmins`. Max 5 connections per user (oldest evicted). When `REDIS_URL` is set, every publish is also fanned out via Redis pub/sub (ioredis) so events reach SSE connections on other serverless instances; without it delivery is in-process only.
- `lib/storage.js` — File storage abstraction. With `BLOB_READ_WRITE_TOKEN` set (production), uploads go to **Vercel Blob** and the DB stores absolute blob URLs. Without it (local dev), files are written to `backend/uploads` and served from `/uploads`. `saveUpload(file)` / `deleteStoredFiles(urls)`. Upload middleware uses multer **memoryStorage**.
- `lib/systemMessages.js` — Creates system chat messages (stored as `type='system'`, content is `JSON.stringify({icon, title, body})`). Auto-pushes via SSE. The `SM` object has named templates: `paymentVerified`, `statusChanged`, `fileUploaded`, `milestoneUpdated`, `revisionRequested`.
- `lib/notifications.js` — Persists `Notification` rows and pushes `notification:new` via SSE.
- `lib/email.js` — Nodemailer wrapper.
- `middleware/auth.js` — `protect` (JWT verify, password-change invalidation) and `authorize(...roles)`. All routes use `protect`; admin-only routes additionally call `authorize('admin')`. User object is attached as `req.user` with both `.id` and `._id` for compatibility.

**Route → Controller pattern:** every `routes/X.js` file imports from `controllers/X.js`.

### Frontend (`frontend/src/`)

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Axios.

#### Auth flow
- JWT stored in `localStorage` (`mbndev_token`). Role stored as a cookie (`mbndev_auth=admin|client`) for edge middleware.
- `AuthContext` manages the session, exposes `user`, `token`, `isAdmin`, `isClient`, `login`, `logout`, `refresh`.
- `src/middleware.ts` (edge) reads the cookie for fast SSR redirects; it is a UX guard only — the JWT is the real credential validated by the backend.

#### Routing structure
```
app/
  (auth)/               login, signup, forgot-password
  dashboard/
    layout.tsx          Shared dashboard shell (sidebar, mobile nav, WhatsNewModal)
    admin/              Admin-only pages (projects, clients, orders, payments, analytics, messages)
    client/             Client-only pages (projects, orders, payments, messages, settings)
  checkout/[orderId]/   Payment submission
  request/              Multi-step project request form
  (public pages)        landing, pricing, portfolio, services, about, contact
```

#### Real-time (SSE)
`useRealtime` hook (`hooks/useRealtime.ts`) manages a **singleton** `EventSource` shared across all components in a session. Components register named handlers (`message:new`, `notification:new`, `project:updated`, `project:activity`) — the connection is only opened once and only closed when no handlers remain. Auto-reconnects with exponential back-off + jitter. Connection URL: `/api/realtime/stream?token=<jwt>`.

#### API client
All HTTP calls go through `lib/api.ts` (Axios instance at `baseURL: '/api'`). Interceptors handle JWT injection, 401 session clearing with redirect, and exponential retry on 502/503/504 for idempotent methods. API namespaces: `authAPI`, `projectAPI`, `orderAPI`, `messageAPI`, `paymentAPI`, `notificationAPI`, `packageAPI`, `adminAPI`.

#### Key shared components
- `components/dashboard/MessageThread.tsx` — Per-project chat. System messages (`type='system'`) are rendered as styled notification cards by `SystemMessage`; the `content` field is always `JSON.stringify({icon, title, body})`.
- `components/dashboard/ProjectCard.tsx` — Used in both admin and client project lists. Includes deadline urgency badge and milestone count.
- `components/dashboard/ProjectStageTracker.tsx` — 5-stage visual stepper for client project detail page.
- `components/ui/WhatsNewModal.tsx` — Version changelog popup. Shows on first login after a version bump. Version and entries defined in `lib/version.ts`.
- `hooks/useRealtime.ts` — SSE singleton hook (see above).

#### Modals and stacking context
The dashboard layout wraps content in a `motion.div` with a CSS transform. This creates a new containing block for `position: fixed` elements inside it. Any modal that must appear above the layout (confirmations, notes panels) must use `ReactDOM.createPortal(modal, document.body)` to escape the transform hierarchy.

#### i18n
**English-only.** The translation dictionary lives in `lib/i18n/translations.ts`; `LanguageContext` provides `t(key)` (a thin wrapper, kept so component code stays unchanged). There is no language switcher and no fr/ar locale files — do not reintroduce them.

### Data model highlights (Prisma)

- `User` — roles: `admin | client`. Plans: `starter | pro | premium | custom`. Has `adminNotes` (private, admin-only), `passwordChangedAt` (token invalidation), `deletionRequestedAt`.
- `Order` → `Project` — an Order becomes a Project after payment. `Project.orderId` is the link.
- `Message` — `senderId: null` = system message; `type: 'system'` with JSON content `{icon, title, body}`.
- `Payment` — manual verification flow: `pending → pending_verification → paid | failed`. Methods: `cih_bank | paypal | taptapsend | mock`.
- No `onDelete: Cascade` on most relations — client deletion requires manual cascade order: payments → orders → projects (one-by-one) → messageReadReceipts → projectFiles → notifications → loginAttempts → user.

### Project status flow
`pending → paid → in-progress → review → revision → completed | cancelled`

The `ProjectStageTracker` maps these to 5 display stages. `SM.statusChanged` fires a system message on each transition.
