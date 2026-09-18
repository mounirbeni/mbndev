# MBN DEV Platform

A full-stack project-management and client portal for delivering web development services. Clients can request projects, submit payment evidence, track progress, access files and communicate with the administration.

## Architecture

- Frontend: Next.js 16 App Router, TypeScript, Tailwind CSS and Framer Motion.
- Backend: Express.js, Prisma ORM and PostgreSQL.
- Authentication: JWT access tokens with refresh-cookie session renewal.
- Real-time updates: Server-Sent Events (SSE); optional Redis fan-out for multiple instances.
- Transactional email: Brevo API when `BREVO_API_KEY` is configured.
- Hosting: Next.js and Express configured together through `vercel.json`.
- Payments: CIH Bank, PayPal and TapTapSend submission flows with manual verification; see the current checkout for availability.

## Local development

Prerequisites: a supported Node.js version, PostgreSQL and npm. Use the environment examples in `backend/.env.example` and `frontend/.env.example`. Never commit real environment variables.

### Backend

```bash
cd backend
npm ci
npm run db:generate
npm run db:push
npm run dev
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

### Safe initial data

`npm run seed` is **additive**: it creates only missing default packages and never wipes customers, orders, projects, messages or payments. It refuses to run when `NODE_ENV=production`. It does not create an administrator unless both `SEED_ADMIN_EMAIL` and a strong `SEED_ADMIN_PASSWORD` (16+ characters) are supplied in the local environment. Existing accounts and package prices remain unchanged. Remove these temporary variables when setup is complete.

If an older version of this project was ever seeded using its historical default administrator credentials, rotate that account's password immediately using your authorized account-management procedure. Never use or share default passwords.

## Checks

```bash
cd backend && npm run lint && npm test && npm run test:integration
cd ../frontend && npm run lint && npm test && npm run build
```

Integration tests need an isolated throwaway database, **never production**. GitHub Actions workflow configuration: `.github/workflows/ci.yml`.

## Roles and project lifecycle

Clients and administrators have separate dashboards with backend role checks. Orders become projects after approved payment. Project statuses include pending, paid, in-progress, review, revision, completed and cancelled. Actual contract scope, payment status and delivery timing must be confirmed in the client's proposal.

## Documentation

- `CLAUDE.md` — implementation details and architecture notes (historical credentials, if mentioned there, are not valid setup instructions).
- `backend/prisma/schema.prisma` — data model.
- `backend/.env.example` and `frontend/.env.example` — environment examples.

## Contributing

Create a feature branch, run available checks and open a pull request. Review privacy/security and customer-facing wording before merging to `master` or promoting a deployment to production.
