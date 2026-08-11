# VANTA ERP — Operations Intelligence Platform

> **Production-grade Mini ERP + CRM Operations Portal** designed for wholesale, distribution, and inventory-heavy enterprises. Engineered with strict transaction guarantees, dual-layer Role-Based Access Control (RBAC), and a high-density executive visual language inspired by Apple, NVIDIA, and Linear.

[![CI Pipeline](https://github.com/vanta/vanta-erp/actions/workflows/ci.yml/badge.svg)](https://github.com/vanta/vanta-erp)
[![Node Version](https://img.shields.io/badge/node-22.x-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-UNLICENSED-zinc.svg)]()

---

## 1. Executive Summary & Design Direction

**VANTA ERP** is built to solve the operational friction wholesale distributors face: siloed CRM follow-ups, inventory stock-outs, inaccurate pricing snapshot histories, and race conditions during delivery order confirmations.

### Visual Language & Design Discipline:
- **Reference UI Match**: Faithfully replicates the provided reference layout — dark slate sidebar (`#0B0F17`), high-contrast crisp content canvas, 4 KPI cards with circular green icon badges, smooth green gradient Spline Sales Overview chart, Recent Sales Challans table with status badges, Low Stock Alert table with red quantity indicators, and Follow-ups Due ledger.
- **Two Brand Colors**: Near Black (`#0A0A0A` / `#0B0F17`) and NVIDIA-style Green (`#76B900`). Neutral whites, grays, and functional contrast surfaces are strictly used for hierarchy and accessibility.
- **Fast Keyboard UX**: Integrated command palette (`⌘K` / `Ctrl+K`) for instant navigation and action creation.
- **Demo RBAC Switcher**: Instant header persona switcher enabling reviewers to test `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` privileges with 1 click.

---

## 2. Architecture & System Flow

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   React 18 (Vite + TypeScript + Tailwind CSS + TanStack Query + Zod)    |
|   - Feature-based UI modules (CRM, Catalog, Ledger, Multi-Item Builder) |
|   - Client-side route guards & reactive RBAC rendering                  |
+------------------------------------+------------------------------------+
                                     |
                                     |  REST API (HTTPS / JSON)
                                     v
+------------------------------------+------------------------------------+
|                              API SERVER                                 |
|   Node.js (Express 4 + TypeScript + Helmet + CORS + Rate Limiter)       |
|   +------------------------------------------------------------------+  |
|   | Middleware: authenticate (JWT) | authorize (RBAC Role Check)     |  |
|   +------------------------------------------------------------------+  |
|   | Domain Services:                                                 |  |
|   |  - AuthService (bcrypt, JWT verification)                        |  |
|   |  - CustomerService (CRM lifecycle, follow-up history ledger)     |  |
|   |  - ProductService (SKU uniqueness, low-stock threshold engine)   |  |
|   |  - StockService (Atomic adjustment, negative stock prevention)   |  |
|   |  - ChallanService (Interactive ACID transaction confirmation)    |  |
|   |  - DashboardService (Real-time aggregated KPIs & spline data)    |  |
|   |  - AuditService (Immutable system operation logging)             |  |
|   +------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     |  Prisma Client ORM (ACID Transactions)
                                     v
+------------------------------------+------------------------------------+
|                            DATABASE TIER                                |
|   PostgreSQL / SQLite Engine                                            |
|   - Indexed relational entities: Users, Customers, Products, Stock,     |
|     SalesChallans, SalesChallanItems (Historical Snapshots), AuditLogs  |
+-------------------------------------------------------------------------+
```

---

## 3. Critical Business Rules & Transaction Guarantees

### Sales Challan Confirmation Flow:
```
+----------------+       +-------------------+       +-----------------------+
|  Sales / Admin | ----> |  Start Database   | ----> | Fetch Challan & Items |
| Confirm Action |       |  Interactive Tx   |       | Verify Status == DRAFT|
+----------------+       +-------------------+       +-----------------------+
                                                                 |
                                                                 v
+------------------------+                             +--------------------+
|  ROLLBACK EVERYTHING   | <--- [Stock < Requested] -- |  Validate Current  |
|  Return HTTP 409       |                             |  Stock for ALL     |
|  Stock remains 5       |                             |  Challan Items     |
|  Challan remains DRAFT |                             +--------------------+
+------------------------+                                       |
                                                          [Stock >= Requested]
                                                                 |
                                                                 v
+------------------------+       +-------------------+       +--------------------+
| Commit Transaction &   | <---- | Update Challan to | <---- | Deduct Stock &     |
| Return 200 OK Response |       | CONFIRMED Status  |       | Create OUT Ledger  |
+------------------------+       +-------------------+       +--------------------+
```

### Snapshot Preservation:
When items are added to a Sales Challan, `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` are immutably written to the `SalesChallanItem` table. Subsequent price increases or catalog edits never alter historical delivery notes or accounting records.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Login & Dashboard Summary** | Full | Full | Full | Full |
| **Customer CRM & Follow-ups** | Create / Edit / Delete | Create & Manage | View Only | View Only |
| **Product Catalog Management** | Create & Update | View Only | Create & Update | View Only |
| **Direct Stock IN / OUT Adjustment** | Allowed | **Blocked (403)** | Allowed | **Blocked (403)** |
| **Draft Sales Challans** | Create & Edit | Create & Edit | View Only | View Only |
| **Confirm Sales Challan (Deduct Stock)** | Allowed | Allowed | **Blocked (403)** | **Blocked (403)** |
| **User & Role Administration** | Full Access | **Blocked (403)** | **Blocked (403)** | **Blocked (403)** |
| **Audit Logs** | Full Access | **Blocked (403)** | **Blocked (403)** | **Blocked (403)** |

---

## 5. Demo Credentials

The database includes seed accounts with pre-hashed bcrypt credentials:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `password123` | Full administrative control, users, settings |
| **SALES** | `sales@example.com` | `password123` | Customers CRM, Follow-ups, Create & Confirm Challans |
| **WAREHOUSE** | `warehouse@example.com` | `password123` | Product catalog, Stock IN/OUT adjustments |
| **ACCOUNTS** | `accounts@example.com` | `password123` | Invoices, financial ledger, sales & stock reports |

---

## 6. Project Structure

```
vanta-erp/
├── apps/
│   ├── web/                        # React + Vite + TypeScript + Tailwind CSS Frontend
│   │   ├── src/
│   │   │   ├── api/                # API client & domain service calls
│   │   │   ├── components/         # Reusable design system, Layout, and Dashboard tables
│   │   │   ├── context/            # AuthContext (with Demo Switcher) & ToastContext
│   │   │   └── pages/              # Dashboard, Customers, Products, Challans, Reports, Users
│   │   └── package.json
│   └── api/                        # Express + TypeScript + Prisma Backend
│       ├── prisma/                 # Relational schema & deterministic seed script
│       ├── src/
│       │   ├── config/             # Environment & Prisma client instance
│       │   ├── controllers/        # Express route controllers
│       │   ├── middlewares/        # JWT Auth, RBAC Authorize, Error handler, Zod Validator
│       │   ├── routes/             # REST endpoint routers
│       │   ├── services/           # Transactional business logic
│       │   └── docs/               # OpenAPI / Swagger specification
│       ├── tests/                  # Vitest + Supertest integration suite
│       └── package.json
├── packages/
│   └── shared/                     # Shared TypeScript types, Zod schemas, Enums, Constants
├── docker/                         # Multi-stage Dockerfiles and Nginx configuration
├── postman/                        # VANTA-ERP Postman Collection with automated test scripts
├── .github/workflows/              # GitHub Actions CI workflow
├── docker-compose.yml              # Local multi-container development environment
└── README.md
```

---

## 7. Quickstart & Local Setup

### Prerequisites
- Node.js `>= 20.0.0`
- npm `>= 10.0.0`

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build Shared Package
```bash
npm run build --workspace=@vanta/shared
```

### Step 3: Database Setup & Seed
```bash
# Push Prisma schema to local database
DATABASE_URL="file:./dev.db" npx prisma db push --schema=apps/api/prisma/schema.prisma

# Seed initial catalog, customers, challans, and demo users
DATABASE_URL="file:./dev.db" npx tsx apps/api/prisma/seed.ts
```

### Step 4: Run Automated Tests
```bash
DATABASE_URL="file:./dev.db" npm run test
```
*Executes all 10 unit and integration tests including the mandatory Insufficient Stock Rollback validation.*

### Step 5: Start Development Servers
```bash
# Start backend API (Port 5000)
npm run dev:api

# In a separate terminal, start frontend Web SPA (Port 5173)
npm run dev:web
```

Access the web portal at **http://localhost:5173** and login with any demo account or use the topbar 1-click persona switcher.

---

## 8. REST API Documentation & Swagger

Interactive Swagger UI documentation is available at:
```
http://localhost:5000/api/docs
```

### Primary Endpoints:
- `GET /api/health` — Service health telemetry
- `POST /api/auth/login` — JWT authentication
- `GET /api/auth/me` — Authenticated profile
- `GET /api/dashboard/summary` — Aggregated KPI metrics & spline chart points
- `GET /api/customers` — Searchable customer CRM ledger
- `POST /api/customers` — Create customer
- `GET /api/customers/:id/follow-ups` — Customer follow-up history
- `POST /api/customers/:id/follow-ups` — Schedule CRM follow-up
- `GET /api/products` — Catalog inventory with low-stock filtering
- `POST /api/products` — Register product (Admin/Warehouse)
- `POST /api/stock/movements` — Record manual stock adjustment (Admin/Warehouse)
- `GET /api/stock/movements` — Stock movement audit ledger
- `GET /api/challans` — Sales challans list
- `POST /api/challans` — Create DRAFT sales challan
- `POST /api/challans/:id/confirm` — **Transactional confirmation & stock deduction**
- `POST /api/challans/:id/cancel` — Cancel challan & reverse inventory
- `GET /api/users` — User administration (Admin only)
- `GET /api/audit-logs` — Immutable activity logs (Admin only)

---

## 9. Docker & Container Deployment

To launch the complete containerized stack (PostgreSQL + API + Nginx Web SPA):
```bash
docker-compose up --build
```
- Frontend Web: `http://localhost`
- Backend API: `http://localhost:5000/api`
- PostgreSQL: `localhost:5432`

---

## 10. Production Deployment

### Frontend (Vercel)
1. Import repository to Vercel.
2. Root directory: `apps/web`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variable: `VITE_API_URL=https://your-api-domain.com/api`.

### Backend (Render / Railway)
1. Build command: `npm run build --workspace=@vanta/shared && npm run build --workspace=@vanta/api`.
2. Start command: `node apps/api/dist/server.js`.
3. Set environment variables:
   - `DATABASE_URL`: Connection string from Neon / Supabase PostgreSQL.
   - `JWT_SECRET`: 256-bit cryptographically secure string.
   - `CORS_ORIGIN`: Your production frontend URL.
