# Arsarazi Gayrimenkul Yonetim Sistemi

Fullstack real estate management platform. Public listing website + Admin CRM/ERP panel.

**Stack:** React + Vite + Tailwind CSS + shadcn/ui + Hono.js + tRPC + Drizzle ORM + MySQL

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone & Install

```bash
git clone https://github.com/garibyolcu/arsarazi-gayrimenkul.git
cd arsarazi-gayrimenkul
npm install
```

### 2. Start Infrastructure (MySQL + Redis + MinIO)

```bash
docker compose up -d
```

Services:
- MySQL: `localhost:3306` (user: `arsarazi`, pass: `arsarazi123`)
- Redis: `localhost:6379`
- MinIO: `localhost:9000` (console: `localhost:9001`)

### 3. Setup Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` if needed (default values work with Docker).

### 4. Database Setup

```bash
npm run db:push
npx tsx db/seed.ts
```

This creates all tables and inserts sample data:
- 3 users (admin/agent), 20 properties, 15 customers, 5 transactions, 7 leads

### 5. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

**Default Login:**
- Email: `admin@arsarazi.com`
- Password: `admin123`

---

## Project Structure

```
/
├── src/                    React frontend
│   ├── pages/              Public pages + Admin panel pages
│   ├── components/         UI components (AdminLayout)
│   ├── hooks/              Custom hooks (useAuth, useDebounce)
│   └── providers/          tRPC provider
├── api/                    Hono.js backend
│   ├── router.ts           tRPC router registration
│   ├── *-router.ts         Feature routers (property, customer, transaction, etc.)
│   └── queries/            Database connection
├── db/                     Drizzle ORM
│   ├── schema.ts           All database tables
│   └── seed.ts             Sample data
├── contracts/              Shared types/constants
└── docker-compose.yml      MySQL + Redis + MinIO
```

---

## Features

### Public Website
- Homepage with property search & featured listings
- Property grid/list view with filters
- Property detail page with image gallery
- Contact form (creates leads)
- About & Contact pages

### Admin Panel (/admin)
- **Dashboard:** Stats cards, charts (Recharts), recent properties
- **Portfolios:** Grid/table view, filters, status management, CRUD
- **Transactions:** Kanban board (LEAD → CLOSED), timeline, notes
- **Customers:** List, search, detail modal, notes
- **Documents:** Card view, type filter, verify, upload
- **Reports:** Portfolio analysis, transaction summary, agent performance, customer sources (with charts)
- **Settings:** User management (admin only), system info

### API Endpoints (tRPC)
- `auth` - Login/logout/me/register with JWT cookies
- `property` - List, get, create, update, delete, status change, image management
- `customer` - Full CRUD + notes
- `transaction` - CRUD + status workflow + timeline + notes
- `lead` - Public creation + admin management
- `document` - Upload, verify, list, delete
- `user` - User management (admin)
- `report` - Dashboard, portfolio, transactions, agents, customers analytics
- `search` - Full-text search across properties & customers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Hono.js, tRPC 11, Zod |
| Database | MySQL 8 (Drizzle ORM) |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Auth | JWT sessions, RBAC (ADMIN/MANAGER/AGENT/VIEWER) |
| Charts | Recharts |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run check` | TypeScript type check |
| `npm run db:push` | Sync schema to database |
| `npm run db:generate` | Generate migration |
| `npm run db:migrate` | Run migrations |
| `npx tsx db/seed.ts` | Insert sample data |
| `npm test` | Run tests |

---

## License

MIT
