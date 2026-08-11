# VANTA ERP — Production Deployment & DevOps Runbook

## 1. Multi-Container Docker Deployment

The application is fully containerized with multi-stage Docker builds.

### Quick Start with Docker Compose:
```bash
docker-compose up --build -d
```

### Services Provisioned:
- **`vanta_postgres`**: PostgreSQL 16 Alpine container with persistent named volume (`pgdata`).
- **`vanta_api`**: Multi-stage Node.js 22 container running Express API on port `5000`.
- **`vanta_web`**: Multi-stage Nginx container serving React SPA on port `80` with built-in `/api/` reverse proxy.

---

## 2. Cloud Platform Deployment Strategies

### Strategy A: Vercel (Frontend) + Render / Railway (Backend) + Neon / Supabase (PostgreSQL)

#### 1. Database Setup (Neon or Supabase)
- Create a PostgreSQL database instance.
- Obtain the pooled `DATABASE_URL` connection string.
- Run migrations: `DATABASE_URL="..." npx prisma db push --schema=apps/api/prisma/schema.prisma`.

#### 2. Backend Deployment (Render / Railway)
- **Root Directory**: Repository root.
- **Build Command**: `npm run build --workspace=@vanta/shared && npm run build --workspace=@vanta/api`.
- **Start Command**: `node apps/api/dist/server.js`.
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=your_secure_256bit_production_secret`
  - `JWT_EXPIRES_IN=7d`
  - `CORS_ORIGIN=https://portal.yourdomain.com`

#### 3. Frontend Deployment (Vercel)
- **Root Directory**: `apps/web`.
- **Build Command**: `npm run build`.
- **Output Directory**: `dist`.
- **Environment Variables**:
  - `VITE_API_URL=https://api.yourdomain.com/api`

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
| `CORS_ORIGIN` | Allowed client domain | `http://localhost:5173` |

### Frontend (`apps/web/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint for API client requests | `http://localhost:5001/api` |

---

## 4. Health Check Telemetry
Check the service status:
```bash
curl -i http://localhost:5001/api/health
```
Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-08-11T10:30:00.000Z",
  "service": "VANTA ERP API",
  "version": "1.0.0"
}
```
