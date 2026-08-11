# VANTA ERP — Role-Based Access Control (RBAC) Security Matrix

## 1. Dual-Layer Security Model

VANTA ERP enforces strict dual-layer authorization:
1. **Client-Side Reactive Shell**: Dynamically shows/hides navigation items, action buttons, and modal dialogs based on the authenticated user's assigned role.
2. **Backend API Middleware**: Evaluates JWT claims and role hierarchies on every incoming HTTP request using `authenticate` and `authorize(...roles)` middlewares. Frontend visibility is never treated as security.

---

## 2. Comprehensive RBAC Permissions Matrix

| Operations Domain | Endpoint / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Authentication** | `POST /api/auth/login`, `GET /api/auth/me` | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Dashboard** | `GET /api/dashboard/summary` | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **CRM Customers** | `GET /api/customers`, `GET /:id` | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| | `POST /api/customers`, `PATCH /:id` | ✅ Create/Edit | ✅ Create/Edit | ❌ 403 | ❌ 403 |
| | `DELETE /api/customers/:id` | ✅ Delete | ❌ 403 | ❌ 403 | ❌ 403 |
| **Follow-ups** | `GET /api/customers/:id/follow-ups` | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| | `POST /api/customers/:id/follow-ups` | ✅ Create | ✅ Create | ❌ 403 | ❌ 403 |
| **Product Catalog**| `GET /api/products`, `GET /:id` | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| | `POST /api/products`, `PATCH /:id` | ✅ Create/Edit | ❌ 403 | ✅ Create/Edit | ❌ 403 |
| **Inventory Stock**| `GET /api/stock/movements` | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| | `POST /api/stock/movements` (Manual IN/OUT) | ✅ Full | ❌ 403 | ✅ Full | ❌ 403 |
| **Sales Challans** | `GET /api/challans`, `GET /:id` | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| | `POST /api/challans` (Create Draft) | ✅ Create | ✅ Create | ❌ 403 | ❌ 403 |
| | `POST /api/challans/:id/confirm` (Deduct Stock) | ✅ Confirm | ✅ Confirm | ❌ 403 | ❌ 403 |
| | `POST /api/challans/:id/cancel` | ✅ Cancel | ✅ Cancel | ❌ 403 | ❌ 403 |
| **Tax Invoices** | `GET /api/invoices`, `GET /:id` | ✅ Read | ✅ Read | ❌ 403 | ✅ Read |
| | `POST /api/invoices/generate` | ✅ Generate | ❌ 403 | ❌ 403 | ✅ Generate |
| | `PATCH /api/invoices/:id/status` (Mark Paid) | ✅ Update | ❌ 403 | ❌ 403 | ✅ Update |
| **Reports** | `GET /api/reports/stock` | ✅ View | ✅ View | ✅ View | ✅ View |
| | `GET /api/reports/sales` | ✅ View | ✅ View | ❌ 403 | ✅ View |
| **User Admin** | `GET /api/users`, `POST /api/users`, `PATCH /:id` | ✅ Full | ❌ 403 | ❌ 403 | ❌ 403 |
| **Audit Logs** | `GET /api/audit-logs` | ✅ Full | ❌ 403 | ❌ 403 | ❌ 403 |

---

## 3. Demo Persona Credentials (Password: `password123`)

- **Admin**: `admin@example.com`
- **Sales**: `sales@example.com`
- **Warehouse**: `warehouse@example.com`
- **Accounts**: `accounts@example.com`
