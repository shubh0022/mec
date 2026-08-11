# VANTA ERP — Architecture & Technical Design Document

## 1. Architectural Philosophy & Overview
**VANTA ERP (Operations Intelligence Platform)** is engineered as a multi-tier, domain-driven enterprise SaaS system. The architecture is structured for high transactional correctness, modularity, strict Role-Based Access Control (RBAC), and low cognitive overhead.

### Key Architectural Pillars:
- **ACID Transaction Guarantees**: Inventory mutations and delivery voucher confirmations are executed within strict database transactions. Negative stock and race conditions are mathematically prevented at the database and service levels.
- **Dual-Layer Authorization**: Enforces role access both at the client routing/UI layer and at the backend Express middleware layer.
- **Historical Snapshot Preservation**: Order line items freeze product names, SKUs, and unit rates at confirmation time, ensuring historical invoice accuracy even if catalog data changes.
- **Enterprise Design Language**: Minimalist palette constrained to Near Black (`#0A0A0A`), NVIDIA Green (`#76B900`), and functional neutral contrast surfaces.

---

## 2. Multi-Tier Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION TIER                                  |
|  React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query + React Hook Form   |
|                                                                                   |
|  [Layout & Shell]         [Feature Modules]            [Design System]            |
|  - Dark Sidebar (#0B0F17) - Dashboard Spline Chart    - Button, Input, Select    |
|  - Dynamic Topbar         - CRM Customer Ledger Drawer - Table & Pagination       |
|  - Breadcrumbs            - Multi-Item Challan Builder - Modal & Drawer           |
|  - Command Palette (⌘K)   - Invoicing & Billing Ledger - Skeleton Loading & Toast |
|  - 1-Click Role Switcher  - Executive Stock & Sales    - Empty & Error States     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTPS / REST (JSON API Contract)
                                          v
+-----------------------------------------+-----------------------------------------+
|                                APPLICATION TIER                                   |
|  Node.js 22 + Express + TypeScript + Zod + Helmet + CORS + Rate Limiter           |
|                                                                                   |
|  [Security & Middleware Layer]                                                    |
|  - authenticate (JWT extraction & verification)                                   |
|  - authorize (Role-Based Access Control: ADMIN, SALES, WAREHOUSE, ACCOUNTS)       |
|  - validateBody / validateQuery (Zod request schema enforcement)                  |
|  - errorHandler (Standardized JSON error envelope & status mapping)               |
|                                                                                   |
|  [Domain Services Layer]                                                          |
|  - AuthService (bcrypt hashing, JWT issuing)                                      |
|  - CustomerService (CRM ledger, non-destructive follow-up history)                |
|  - ProductService (Unique SKU engine, low-stock threshold queries)                |
|  - StockService (Atomic IN/OUT adjustments, negative stock guards)                |
|  - ChallanService (Interactive ACID transactions, insufficient stock rollback)    |
|  - InvoiceService (Challan-to-invoice binding, GST calculation, status machine)   |
|  - ReportService (Real-time stock valuation & sales revenue aggregation)          |
|  - DashboardService (Real-time aggregated KPIs & spline points)                   |
|  - AuditService (Immutable system operation logging)                              |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Prisma Client ORM (ACID Transactions)
                                          v
+-----------------------------------------+-----------------------------------------+
|                                 DATA TIER                                         |
|  Relational Database Engine (PostgreSQL / SQLite)                                 |
|                                                                                   |
|  [Relational Schema & Indexes]                                                    |
|  - Users (Unique email, passwordHash, role, isActive)                             |
|  - Customers (Unique customerCode, business details, GSTIN, contacts)             |
|  - CustomerFollowUps (Non-destructive interaction audit trail)                     |
|  - Products (Unique SKU, unique productCode, prices, stock, thresholds)           |
|  - Warehouses & Categories (Normalized organizational structures)                 |
|  - StockMovements (Immutable IN/OUT inventory ledger)                             |
|  - SalesChallans & SalesChallanItems (Historical snapshots & delivery tracking)   |
|  - Invoices (GST-compliant billing records linked to challans)                    |
|  - AuditLogs (Immutable platform activity records)                                |
+-----------------------------------------------------------------------------------+
```

---

## 3. Monorepo Structure

The repository is organized as an npm workspace monorepo:

```
vanta-erp/
├── packages/
│   └── shared/                  # @vanta/shared: Types, DTOs, Enums, Zod schemas
├── apps/
│   ├── api/                     # @vanta/api: Express 4 REST API, Prisma schema, tests
│   └── web/                     # @vanta/web: React 18 SPA, Tailwind CSS, Vite
├── docs/                        # Complete architecture and operations documentation
├── postman/                     # Comprehensive Postman API collection
├── docker/                      # Multi-stage Dockerfiles and Nginx reverse proxy
└── docker-compose.yml           # Multi-container orchestration (Postgres, API, Web)
```

---

## 4. Standardized API Envelopes

### Success Envelope (HTTP 200, 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Envelope (HTTP 400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "code": "INSUFFICIENT_STOCK",
  "message": "Insufficient stock for product PVC-001. Available: 5, Requested: 6.",
  "errors": [
    {
      "sku": "PVC-001",
      "available": 5,
      "requested": 6
    }
  ]
}
```
