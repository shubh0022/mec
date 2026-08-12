# VANTA ERP — Production Deployment & DevOps Runbook

## 1. Multi-Container Docker Deployment

The application is fully containerized with multi-stage Docker builds and automated database synchronization.

### Quick Start with Docker Compose:
```bash
docker-compose up --build -d
```

### Services Provisioned:
- **`vanta_postgres`**: PostgreSQL 16 Alpine container with persistent named volume (`pgdata`) on port `5433` -> `5432`.
- **`vanta_api`**: Multi-stage Node.js 22 container running Express API on port `5001`. Automatically applies schema migrations and seeds default data on boot.
- **`vanta_web`**: Multi-stage Nginx container serving React SPA on ports `80` / `3000` with built-in `/api/` reverse proxy to the API engine.

---

## 2. Cloud Platform Deployment Strategies

### Strategy A: Vercel (Frontend) + Render / Railway (Backend) + Neon / Supabase (PostgreSQL)

```
┌────────────────────────────────────────────────────────┐
│                      Client Tier                       │
│           Vercel Global Edge Network (CDN)             │
│   • React 18 SPA (apps/web)                            │
│   • vercel.json SPA rewrites + Immutable cache         │
│   • Vendor bundle chunk splitting (Rollup)             │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS (VITE_API_URL)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Application Tier                     │
│         Render / Railway / Fly.io / AWS ECS            │
│   • Node.js 22 Express Engine (:5001)                  │
│   • Prisma ORM Engine (apps/api)                       │
│   • Health check: /api/health                          │
└───────────────────────────┬────────────────────────────┘
                            │ Connection Pool
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Data Tier                         │
│         Neon / Supabase / AWS RDS PostgreSQL           │
│   • Persistent Relational ACID Store                   │
└────────────────────────────────────────────────────────┘
```

#### 1. Database Setup (Neon or Supabase)
1. Create a PostgreSQL database instance (PostgreSQL 16+).
2. Obtain the pooled connection string: `DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/vanta_erp?sslmode=require"`.
3. Push schema and seed data:
   ```bash
   DATABASE_URL="..." npx prisma db push --schema=apps/api/prisma/schema.prisma
   DATABASE_URL="..." npx tsx apps/api/prisma/seed.ts
   ```

#### 2. Backend Deployment (Render / Railway / Fly.io)
- **Root Directory**: Repository root (`./`).
- **Build Command**: `npm run build --workspace=@vanta/shared && npm run build --workspace=@vanta/api`.
- **Start Command**: `node apps/api/dist/server.js`.
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5001`
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=your_secure_256bit_production_secret`
  - `JWT_EXPIRES_IN=7d`
  - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`

#### 3. Frontend Deployment (Vercel)
The repository includes root [`vercel.json`](file:///Users/shubham/mec/vercel.json) and [`apps/web/vercel.json`](file:///Users/shubham/mec/apps/web/vercel.json) pre-configured with SPA routing rewrites and vendor chunking.

- **Option 1: Deploy from Monorepo Root (Recommended)**
  - **Framework Preset**: `Vite`
  - **Root Directory**: `./`
  - **Build Command**: `npm run build --workspace=@vanta/shared && npm run build --workspace=@vanta/web`
  - **Output Directory**: `apps/web/dist`
  - **Install Command**: `npm install`
  - **Environment Variables**:
    - `VITE_API_URL=https://api.yourdomain.com/api` (or your Render/Railway backend URL)

- **Option 2: Deploy CLI Command**
  ```bash
  npx vercel --prod
  ```

---

## 3. Environment Variables Reference

### Backend (`apps/api/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API listening port | `5001` |
| `NODE_ENV` | Runtime environment | `production` / `development` |
| `DATABASE_URL` | PostgreSQL or SQLite connection URI | `file:./dev.db` / `postgresql://...` |
| `JWT_SECRET` | Cryptographic secret for signing tokens | `vanta_secret_2026` |
| `JWT_EXPIRES_IN` | Session duration | `7d` |
| `CORS_ORIGIN` | Allowed client domain (or `*`) | `https://your-app.vercel.app` |

### Frontend (`apps/web/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint for API client requests | `https://api.yourdomain.com/api` |

---

## 4. Health Check Telemetry & Verification
Check the service status:
```bash
curl -i https://api.yourdomain.com/api/health
```
Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-08-12T11:00:00.000Z",
  "service": "VANTA ERP API",
  "version": "1.0.0"
}
```
