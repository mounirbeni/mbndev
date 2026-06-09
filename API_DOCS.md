# MBN DEV — API Documentation

**Base URL:** `/api`  
**Auth:** Bearer JWT in `Authorization` header — `Authorization: Bearer <token>`  
**Content-Type:** `application/json` (unless noted)  
**All responses** wrap data in `{ success: true, ... }` or `{ success: false, message: "..." }`.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Projects](#2-projects)
3. [Orders](#3-orders)
4. [Payments](#4-payments)
5. [Messages](#5-messages)
6. [Notifications](#6-notifications)
7. [Packages](#7-packages)
8. [Admin](#8-admin)
9. [Leads](#9-leads)
10. [Search](#10-search)
11. [Real-Time (SSE)](#11-real-time-sse)
12. [Error Reference](#12-error-reference)

---

## 1. Authentication

### POST `/api/auth/register`
Create a new client account.

**Auth required:** No

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass1!",
  "phone": "+212600000000",
  "company": "Acme Corp"
}
```

**Response `201`:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "clx...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "client",
    "plan": "starter"
  }
}
```

---

### POST `/api/auth/login`
Authenticate and receive a JWT.

**Auth required:** No

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "StrongPass1!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "role": "client", "plan": "starter" }
}
```

---

### POST `/api/auth/forgot-password`
Send a password-reset email.

**Auth required:** No

**Request body:**
```json
{ "email": "jane@example.com" }
```

**Response `200`:**
```json
{ "success": true, "message": "Reset email sent" }
```

---

### POST `/api/auth/reset-password`
Set a new password using the token from the reset email.

**Auth required:** No

**Request body:**
```json
{
  "token": "<reset-token>",
  "password": "NewStrongPass1!"
}
```

**Response `200`:**
```json
{ "success": true, "message": "Password updated" }
```

---

### POST `/api/auth/refresh`
Exchange a still-valid JWT for a fresh one (extended expiry).

**Auth required:** No (pass current token in body)

**Request body:**
```json
{ "token": "<current-jwt>" }
```

**Response `200`:**
```json
{ "success": true, "token": "<new-jwt>" }
```

---

### POST `/api/auth/logout`
Stateless logout — client should discard the token.

**Auth required:** No

**Response `200`:**
```json
{ "success": true, "message": "Logged out" }
```

---

### POST `/api/auth/check-email`
Real-time uniqueness check (used during signup form).

**Auth required:** No

**Request body:**
```json
{ "email": "jane@example.com" }
```

**Response `200`:**
```json
{ "success": true, "available": true }
```

---

### POST `/api/auth/check-phone`
Real-time phone uniqueness check.

**Auth required:** No

**Request body:**
```json
{ "phone": "+212600000000" }
```

**Response `200`:**
```json
{ "success": true, "available": true }
```

---

### GET `/api/auth/me`
Return the authenticated user's profile.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "client",
    "plan": "starter",
    "avatar": null,
    "company": "Acme Corp",
    "phone": "+212600000000",
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

---

### PUT `/api/auth/profile`
Update the authenticated user's profile or password.

**Auth required:** Yes (any role)

**Request body** (all fields optional):
```json
{
  "name": "Jane Smith",
  "phone": "+212611111111",
  "company": "New Corp",
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass1!"
}
```

**Response `200`:**
```json
{ "success": true, "user": { ... } }
```

---

### DELETE `/api/auth/account`
Request account deletion (sets `deletionRequestedAt`; admin must confirm hard delete).

**Auth required:** Yes (any role)

**Response `200`:**
```json
{ "success": true, "message": "Deletion request submitted" }
```

---

### DELETE `/api/auth/account/cancel`
Cancel a pending deletion request.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{ "success": true, "message": "Deletion request cancelled" }
```

---

## 2. Projects

### GET `/api/projects`
List all projects. Admin sees all; clients are redirected to `/mine`.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status (`pending`, `in-progress`, `review`, `revision`, `completed`, `cancelled`) |
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `20`) |

**Response `200`:**
```json
{
  "success": true,
  "projects": [ { ... } ],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

---

### GET `/api/projects/mine`
List projects belonging to the authenticated client.

**Auth required:** Yes — `client`

**Response `200`:**
```json
{
  "success": true,
  "projects": [ { "id": "...", "title": "...", "status": "in-progress", ... } ]
}
```

---

### GET `/api/projects/stats`
Aggregate project counts by status.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{
  "success": true,
  "stats": {
    "total": 42,
    "pending": 5,
    "inProgress": 12,
    "review": 3,
    "revision": 2,
    "completed": 18,
    "cancelled": 2
  }
}
```

---

### GET `/api/projects/share/:token`
Retrieve a project by its shareable token (no auth required).

**Auth required:** No

**Response `200`:**
```json
{
  "success": true,
  "project": {
    "id": "...",
    "title": "...",
    "status": "in-progress",
    "milestones": [ ... ]
  }
}
```

---

### POST `/api/projects`
Create a project directly (typically triggered internally after payment).

**Auth required:** Yes — `admin` or `client`

**Request body:**
```json
{
  "title": "E-commerce Website",
  "description": "Full-stack store with Stripe",
  "orderId": "clx...",
  "packageId": "clx..."
}
```

**Response `201`:**
```json
{ "success": true, "project": { "id": "...", "title": "...", "status": "pending" } }
```

---

### GET `/api/projects/:id`
Get a single project.

**Auth required:** Yes — admin sees any; client sees own only.

**Response `200`:**
```json
{
  "success": true,
  "project": {
    "id": "clx...",
    "title": "E-commerce Website",
    "status": "in-progress",
    "milestones": [
      { "id": "...", "title": "Design mockups", "completed": true }
    ],
    "files": [
      { "id": "...", "name": "brief.pdf", "url": "...", "uploadedAt": "..." }
    ],
    "client": { "id": "...", "name": "Jane Doe", "email": "..." },
    "order": { "id": "...", "packageId": "..." }
  }
}
```

---

### PUT `/api/projects/:id`
Update project fields or status.

**Auth required:** Yes — `admin`

**Request body** (all fields optional):
```json
{
  "title": "Updated Title",
  "status": "review",
  "description": "...",
  "deadline": "2026-08-01T00:00:00.000Z",
  "milestones": [
    { "id": "existing-id", "completed": true },
    { "title": "New milestone" }
  ]
}
```

**Notes:**
- Status transitions fire a `SM.statusChanged` system message and SSE push.
- Valid status values: `pending`, `paid`, `in-progress`, `review`, `revision`, `completed`, `cancelled`.

**Response `200`:**
```json
{ "success": true, "project": { ... } }
```

---

### DELETE `/api/projects/:id`
Permanently delete a project and its related data.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "message": "Project deleted" }
```

---

### POST `/api/projects/:id/upload`
Upload a file to a project.

**Auth required:** Yes (any role)

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The file to upload (max 10 MB) |

**Response `201`:**
```json
{
  "success": true,
  "file": {
    "id": "...",
    "name": "brief.pdf",
    "url": "https://...",
    "size": 204800,
    "uploadedAt": "2026-06-09T12:00:00.000Z"
  }
}
```

---

### POST `/api/projects/:id/share`
Generate a public shareable token for a project.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{
  "success": true,
  "shareUrl": "https://mbndev.com/share/abc123tok"
}
```

---

## 3. Orders

### GET `/api/orders/price`
Calculate the estimated price for an order before submission.

**Auth required:** Yes (any role)

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `packageId` | string | Package to price |
| `addons` | string | Comma-separated addon slugs |

**Response `200`:**
```json
{
  "success": true,
  "price": 1200,
  "breakdown": { "base": 999, "addons": 201 }
}
```

---

### POST `/api/orders`
Submit a new project request.

**Auth required:** Yes (any role)

**Request body:**
```json
{
  "packageId": "clx...",
  "title": "Portfolio Website",
  "description": "I need a personal portfolio...",
  "budget": 1500,
  "deadline": "2026-09-01",
  "addons": ["seo", "copywriting"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "order": {
    "id": "clx...",
    "status": "pending",
    "title": "Portfolio Website",
    "price": 1200
  }
}
```

---

### GET `/api/orders`
List orders. Admin sees all; client sees own.

**Auth required:** Yes (any role)

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response `200`:**
```json
{
  "success": true,
  "orders": [ { "id": "...", "title": "...", "status": "pending", "price": 1200 } ],
  "total": 10
}
```

---

### GET `/api/orders/:id`
Get a single order.

**Auth required:** Yes — admin sees any; client sees own only.

**Response `200`:**
```json
{
  "success": true,
  "order": {
    "id": "clx...",
    "status": "pending",
    "title": "Portfolio Website",
    "price": 1200,
    "package": { "name": "Pro", "deliveryDays": 14 },
    "client": { "id": "...", "name": "Jane Doe" }
  }
}
```

---

### PUT `/api/orders/:id`
Update an order (admin: any field; client: limited to draft state).

**Auth required:** Yes (any role)

**Request body** (all fields optional):
```json
{
  "status": "approved",
  "price": 1350,
  "adminNote": "Adjusted for extra pages"
}
```

**Response `200`:**
```json
{ "success": true, "order": { ... } }
```

---

### PUT `/api/orders/:id/cancel`
Cancel an order.

**Auth required:** Yes (any role — client can only cancel own pending orders)

**Response `200`:**
```json
{ "success": true, "message": "Order cancelled" }
```

---

### DELETE `/api/orders/:id`
Hard-delete an order.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "message": "Order deleted" }
```

---

## 4. Payments

### POST `/api/payments/manual`
Submit a manual payment with proof of transfer.

**Auth required:** Yes (any role)

**Request body:**
```json
{
  "orderId": "clx...",
  "method": "cih_bank",
  "amount": 1200,
  "currency": "MAD",
  "proofUrl": "https://..."
}
```

**Supported `method` values:** `cih_bank`, `paypal`, `taptapsend`, `mock`

**Response `201`:**
```json
{
  "success": true,
  "payment": {
    "id": "clx...",
    "status": "pending_verification",
    "amount": 1200,
    "method": "cih_bank"
  }
}
```

---

### GET `/api/payments`
List payments. Admin sees all (filterable); client sees own.

**Auth required:** Yes (any role)

**Query params (admin only):**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`, `pending_verification`, `paid`, `failed` |
| `flagged` | boolean | `true` to show only fraud-flagged payments |
| `page` | number | Page number |

**Response `200`:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "clx...",
      "status": "paid",
      "amount": 1200,
      "method": "paypal",
      "createdAt": "2026-06-01T10:00:00.000Z",
      "order": { "id": "...", "title": "Portfolio Website" }
    }
  ],
  "total": 5
}
```

---

### GET `/api/payments/:id`
Get a single payment. Client can only view own.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{
  "success": true,
  "payment": {
    "id": "clx...",
    "status": "pending_verification",
    "amount": 1200,
    "currency": "MAD",
    "method": "cih_bank",
    "proofUrl": "https://...",
    "riskScore": 12,
    "order": { "id": "...", "title": "Portfolio Website" },
    "client": { "id": "...", "name": "Jane Doe" }
  }
}
```

---

### PUT `/api/payments/:id/approve`
Approve a manual payment. Triggers project creation if none exists and fires `SM.paymentVerified`.

**Auth required:** Yes — `admin`

**Request body** (optional):
```json
{ "note": "Confirmed via bank statement" }
```

**Response `200`:**
```json
{
  "success": true,
  "payment": { "id": "...", "status": "paid" },
  "project": { "id": "...", "status": "in-progress" }
}
```

---

### PUT `/api/payments/:id/reject`
Reject a manual payment.

**Auth required:** Yes — `admin`

**Request body:**
```json
{ "reason": "Amount does not match invoice" }
```

**Response `200`:**
```json
{ "success": true, "payment": { "id": "...", "status": "failed" } }
```

---

### GET `/api/payments/:id/events`
Immutable audit trail for a payment (all state transitions).

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{
  "success": true,
  "events": [
    { "id": "...", "type": "created", "actor": "client", "ts": "2026-06-01T10:00:00.000Z" },
    { "id": "...", "type": "approved", "actor": "admin", "note": "...", "ts": "2026-06-01T11:00:00.000Z" }
  ]
}
```

---

### POST `/api/payments/reconcile`
Trigger an on-demand payment reconciliation run (async — responds immediately).

**Auth required:** Yes — `admin`

**Response `202`:**
```json
{ "success": true, "message": "Reconciliation started" }
```

---

### GET `/api/payments/meta/analytics`
Payment analytics for the admin dashboard.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `from` | ISO date | Start of range |
| `to` | ISO date | End of range |

**Response `200`:**
```json
{
  "success": true,
  "analytics": {
    "totalRevenue": 24000,
    "paidCount": 20,
    "pendingCount": 3,
    "failedCount": 1,
    "byMethod": { "cih_bank": 12, "paypal": 6, "taptapsend": 2 },
    "revenueByMonth": [ { "month": "2026-05", "revenue": 8000 } ]
  }
}
```

---

### POST `/api/payments/mock`
Create a mock payment that auto-approves (dev/demo only — blocked in production).

**Auth required:** Yes (any role)

**Request body:**
```json
{ "orderId": "clx...", "amount": 1200 }
```

**Response `201`:**
```json
{ "success": true, "payment": { "id": "...", "status": "paid" } }
```

---

## 5. Messages

### GET `/api/messages/threads`
List all project threads for the authenticated user (admin sees all; client sees own).

**Auth required:** Yes (any role)

**Response `200`:**
```json
{
  "success": true,
  "threads": [
    {
      "projectId": "clx...",
      "projectTitle": "E-commerce Website",
      "lastMessage": { "content": "Files uploaded.", "createdAt": "..." },
      "unreadCount": 2
    }
  ]
}
```

---

### GET `/api/messages/unread`
Total unread message count across all threads for the current user.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{ "success": true, "count": 5 }
```

---

### GET `/api/messages/:projectId`
Get messages for a project thread with cursor-based pagination.

**Auth required:** Yes — admin sees any; client sees own only.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Message ID to paginate from (oldest-first) |
| `limit` | number | Messages per page (default `30`) |

**Response `200`:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "clx...",
      "content": "Your project has started.",
      "type": "system",
      "senderId": null,
      "createdAt": "2026-06-01T10:00:00.000Z"
    },
    {
      "id": "clx...",
      "content": "Hi! Can you share more details?",
      "type": "user",
      "senderId": "clx...",
      "sender": { "name": "Mounir Banni", "role": "admin" },
      "createdAt": "2026-06-01T10:05:00.000Z"
    }
  ],
  "nextCursor": "clx...",
  "hasMore": true
}
```

**Note on system messages:** `type: "system"` messages have `content` as a JSON string: `{"icon": "...", "title": "...", "body": "..."}`. The frontend renders these as styled cards.

---

### POST `/api/messages/:projectId`
Send a message in a project thread.

**Auth required:** Yes (any role)

**Request body:**
```json
{ "content": "Can we schedule a call?" }
```

**Response `201`:**
```json
{
  "success": true,
  "message": {
    "id": "clx...",
    "content": "Can we schedule a call?",
    "type": "user",
    "senderId": "clx...",
    "createdAt": "2026-06-09T14:30:00.000Z"
  }
}
```

**Note:** The new message is broadcast via SSE (`message:new`) to all parties in the project.

---

## 6. Notifications

### GET `/api/notifications`
Get the latest 50 notifications for the authenticated user.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "clx...",
      "type": "payment_verified",
      "read": false,
      "payload": { "projectId": "...", "message": "Your payment was approved." },
      "createdAt": "2026-06-09T11:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/notifications/unread-count`
Count of unread notifications.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{ "success": true, "count": 3 }
```

---

### PUT `/api/notifications/:id/read`
Mark a single notification as read.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{ "success": true }
```

---

### PUT `/api/notifications/read-all`
Mark all notifications as read.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{ "success": true }
```

---

## 7. Packages

### GET `/api/packages`
List all active service packages (used on the public pricing page).

**Auth required:** No

**Response `200`:**
```json
{
  "success": true,
  "packages": [
    {
      "id": "clx...",
      "name": "Pro",
      "slug": "pro",
      "price": 999,
      "description": "Complete business website",
      "features": ["5 pages", "SEO setup", "Contact form"],
      "pages": 5,
      "revisions": 3,
      "deliveryDays": 14,
      "popular": true
    }
  ]
}
```

---

### POST `/api/packages`
Create a new service package.

**Auth required:** Yes — `admin`

**Request body:**
```json
{
  "name": "Premium",
  "slug": "premium",
  "price": 2499,
  "description": "Full-featured e-commerce solution",
  "features": ["Unlimited pages", "E-commerce", "3 months support"],
  "pages": null,
  "revisions": 5,
  "deliveryDays": 30,
  "popular": false
}
```

**Response `201`:**
```json
{ "success": true, "package": { "id": "...", "name": "Premium", ... } }
```

---

### PUT `/api/packages/:id`
Update a package. All fields are optional (partial update).

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "package": { ... } }
```

---

### DELETE `/api/packages/:id`
Soft-delete a package (sets `isActive: false` — does not remove from DB).

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "message": "Package deactivated" }
```

---

## 8. Admin

All routes in this section require `admin` role.

### GET `/api/admin/clients`
List all client accounts.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by name or email |
| `plan` | string | `starter`, `pro`, `premium`, `custom` |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response `200`:**
```json
{
  "success": true,
  "clients": [
    {
      "id": "clx...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "plan": "pro",
      "projectCount": 3,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "total": 24
}
```

---

### GET `/api/admin/clients/:id`
Get a single client with full detail including admin notes.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{
  "success": true,
  "client": {
    "id": "clx...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "plan": "pro",
    "adminNotes": "VIP client — always prioritize.",
    "projects": [ ... ],
    "payments": [ ... ]
  }
}
```

---

### PUT `/api/admin/clients/:id`
Update a client's plan, status, or admin notes.

**Auth required:** Yes — `admin`

**Request body** (all optional):
```json
{
  "plan": "premium",
  "isActive": true,
  "adminNotes": "Upgraded to premium on renewal."
}
```

**Response `200`:**
```json
{ "success": true, "client": { ... } }
```

---

### DELETE `/api/admin/clients/:id`
Hard-delete a client and all related data in safe cascade order.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "message": "Client deleted" }
```

---

### GET `/api/admin/analytics`
Aggregate KPIs for the admin dashboard.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `from` | ISO date | Start date |
| `to` | ISO date | End date |

**Response `200`:**
```json
{
  "success": true,
  "analytics": {
    "totalRevenue": 48000,
    "activeProjects": 12,
    "pendingOrders": 5,
    "newClients": 8,
    "revenueByMonth": [ { "month": "2026-05", "revenue": 12000 } ],
    "projectsByStatus": { "in-progress": 12, "review": 3, "completed": 18 }
  }
}
```

---

### POST `/api/admin/broadcast`
Send a broadcast message or email to all clients or a filtered segment.

**Auth required:** Yes — `admin`

**Request body:**
```json
{
  "subject": "Platform maintenance tonight",
  "body": "We will be down from 02:00–04:00 UTC.",
  "target": "all"
}
```

**`target` values:** `all`, `active`, `plan:pro`, `plan:premium`

**Response `200`:**
```json
{ "success": true, "sent": 24 }
```

---

### GET `/api/admin/activity`
Admin audit log — actions taken by the admin.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | string | Action type filter |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response `200`:**
```json
{
  "success": true,
  "activity": [
    {
      "id": "...",
      "type": "payment_approved",
      "description": "Approved payment clx... for Jane Doe",
      "createdAt": "2026-06-09T11:00:00.000Z"
    }
  ],
  "total": 120
}
```

---

## 9. Leads

All routes require `admin` role.

### GET `/api/leads`
List all leads with optional filtering.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `new`, `contacted`, `qualified`, `lost`, `converted` |
| `source` | string | `contact_form`, `referral`, `linkedin`, `cold_outreach`, etc. |
| `search` | string | Name, email, or company |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response `200`:**
```json
{
  "success": true,
  "leads": [
    {
      "id": "clx...",
      "name": "Ahmed Bennani",
      "company": "StartupX",
      "email": "ahmed@startupx.ma",
      "phone": "+212600000001",
      "status": "new",
      "source": "contact_form",
      "notes": "Interested in e-commerce package.",
      "createdAt": "2026-06-01T09:00:00.000Z"
    }
  ],
  "total": 82
}
```

---

### POST `/api/leads`
Create a single lead.

**Auth required:** Yes — `admin`

**Request body:**
```json
{
  "name": "Ahmed Bennani",
  "company": "StartupX",
  "email": "ahmed@startupx.ma",
  "phone": "+212600000001",
  "source": "linkedin",
  "status": "new",
  "notes": "Met at DevDays Casablanca"
}
```

**Response `201`:**
```json
{ "success": true, "lead": { "id": "...", ... } }
```

---

### POST `/api/leads/import`
Bulk-import leads from a CSV payload.

**Auth required:** Yes — `admin`

**Request body:**
```json
{
  "leads": [
    { "name": "Lead One", "email": "one@example.com", "source": "csv" },
    { "name": "Lead Two", "email": "two@example.com", "source": "csv" }
  ]
}
```

**Response `201`:**
```json
{ "success": true, "imported": 2, "skipped": 0 }
```

**Note:** Duplicate emails are upserted, not rejected.

---

### GET `/api/leads/:id`
Get a single lead.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "lead": { ... } }
```

---

### PUT `/api/leads/:id`
Update a lead.

**Auth required:** Yes — `admin`

**Request body** (all optional):
```json
{
  "status": "contacted",
  "notes": "Sent proposal on 2026-06-09"
}
```

**Response `200`:**
```json
{ "success": true, "lead": { ... } }
```

---

### DELETE `/api/leads/:id`
Delete a lead.

**Auth required:** Yes — `admin`

**Response `200`:**
```json
{ "success": true, "message": "Lead deleted" }
```

---

## 10. Search

### GET `/api/search`
Global search across projects, orders, clients, and messages.

**Auth required:** Yes — `admin`

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | Scope: `projects`, `orders`, `clients`, `messages` (default: all) |
| `limit` | number | Results per type (default `5`) |

**Response `200`:**
```json
{
  "success": true,
  "results": {
    "projects": [ { "id": "...", "title": "E-commerce Website" } ],
    "clients":  [ { "id": "...", "name": "Jane Doe", "email": "..." } ],
    "orders":   [],
    "messages": []
  }
}
```

---

## 11. Real-Time (SSE)

### GET `/api/realtime/stream?token=<jwt>`
Open a Server-Sent Events connection for real-time updates.

**Auth required:** JWT passed as query param `token` (EventSource API does not support custom headers).

**Connection behavior:**
- Immediately emits a `ready` event on connect.
- Sends a heartbeat comment (`: ping <timestamp>`) every 25 seconds.
- Max 5 simultaneous connections per user — the oldest is evicted when the limit is exceeded.
- Reconnect on close — the frontend `useRealtime` hook handles exponential back-off with jitter.

**Initial `ready` event:**
```
event: ready
data: {"userId":"clx...","role":"client","ts":1717934400000}
```

**Event types pushed by the server:**

| Event name | Payload | Sent to |
|------------|---------|---------|
| `message:new` | `{ projectId, message: { id, content, sender, createdAt } }` | Project participants |
| `notification:new` | `{ notification: { id, type, payload, createdAt } }` | Notification owner |
| `project:updated` | `{ project: { id, status, ... } }` | Project client + admins |
| `project:activity` | `{ projectId, activity: { type, description } }` | Admins |

**Client-side example:**
```js
const es = new EventSource(`/api/realtime/stream?token=${jwt}`);
es.addEventListener('message:new', (e) => {
  const { projectId, message } = JSON.parse(e.data);
});
es.addEventListener('notification:new', (e) => {
  const { notification } = JSON.parse(e.data);
});
```

---

## 12. Error Reference

All error responses follow:
```json
{ "success": false, "message": "Human-readable description" }
```

| HTTP Status | Meaning |
|-------------|---------|
| `400` | Bad request — validation failed or missing required fields |
| `401` | Unauthorized — no token, invalid token, expired token, or token issued before last password change |
| `403` | Forbidden — authenticated but role lacks permission |
| `404` | Resource not found |
| `409` | Conflict — duplicate email, phone, or slug |
| `422` | Unprocessable — request body parsed but business rule violated |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

### Common `401` scenarios

| Message | Cause |
|---------|-------|
| `Not authorized, no token` | `Authorization` header missing |
| `Token invalid or expired` | JWT signature bad or past `exp` |
| `Session expired. Please sign in again.` | Token issued before `passwordChangedAt` |
| `User not found or deactivated` | Account deleted or `isActive: false` |

### Rate limiting
All routes are rate-limited. Auth routes (`/register`, `/login`, `/forgot-password`) have a stricter limit. On breach the server responds `429` with a `Retry-After` header.
