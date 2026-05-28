# MBN Dev Platform

A full-stack project management and client portal platform built to streamline the delivery of digital services. It provides a centralized space for clients to request projects, make payments, track progress, and communicate with the administration in real-time.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Data Fetching:** Axios
- **Real-time:** Server-Sent Events (SSE) via custom hooks
- **Internationalization (i18n):** English, French, Arabic (with RTL support)

### Backend
- **Framework:** Express.js (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** In-memory Server-Sent Events (SSE)
- **Security:** Helmet, CORS, HPP, Rate Limiting
- **Email:** Nodemailer

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- npm or yarn

### Environment Variables
You need to set up `.env` files in both the `frontend/` and `backend/` directories. Refer to the respective `.env.example` files if available, or configure database connections, JWT secrets, and port configurations.

### Running the Backend

```bash
cd backend
npm install
npm run db:push      # Push Prisma schema to the database
npm run db:generate  # Generate Prisma client
npm run seed         # Seed database with initial admin/client data
npm run dev          # Start the development server (default: port 5000)
```

**Demo Credentials (after seeding):**
- **Admin:** `admin@mbndev.com` / `admin123`
- **Client:** `client@demo.com` / `client123`

### Running the Frontend

```bash
cd frontend
npm install
npm run dev          # Start the Next.js dev server (default: port 3000)
```

## 🏗️ Architecture & Features

- **Monorepo-style Deployment:** Deployed together on Vercel (`vercel.json`) where `/api/*` requests are routed to the Express backend and all other requests serve the Next.js frontend.
- **Roles & Permissions:** System separates users into `admin` and `client` roles with restricted access to specific dashboards and capabilities.
- **Real-time Capabilities:** Implements Server-Sent Events (SSE) to push live chat messages, project status updates, and notifications without requiring page reloads.
- **Project Lifecycle:** Tracks orders from payment to project completion: `pending → paid → in-progress → review → revision → completed | cancelled`.
- **Custom Payment Flow:** Supports manual payment verification flows via various methods (CIH Bank, PayPal, TapTapSend).

## 📄 Important Files
- `CLAUDE.md`: Contains advanced documentation and architecture guidelines.
- `backend/prisma/schema.prisma`: The database schema definition.

## 🤝 Contributing
1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Commit your changes (`git commit -m 'Add some feature'`)
3. Push to the branch (`git push origin feature/my-feature`)
4. Open a Pull Request
