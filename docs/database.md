# VANTA ERP — Database Schema & Data Integrity Design

## 1. Relational Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Customer : "created"
    User ||--o{ CustomerFollowUp : "logged"
    User ||--o{ StockMovement : "authorized"
    User ||--o{ SalesChallan : "created"
    User ||--o{ SalesChallan : "confirmed"
    User ||--o{ AuditLog : "performed"

    Customer ||--o{ CustomerFollowUp : "has"
    Customer ||--o{ SalesChallan : "orders"
    Customer ||--o{ Invoice : "billed"

    Category ||--o{ Product : "categorizes"
    Warehouse ||--o{ Product : "stores"

    Product ||--o{ StockMovement : "tracks"
    Product ||--o{ SalesChallanItem : "referenced"

    SalesChallan ||--|{ SalesChallanItem : "contains"
    SalesChallan ||--o| Invoice : "generates"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        string role
        boolean isActive
        datetime createdAt
    }

    Customer {
        string id PK
        string customerCode UK
        string customerName
        string mobile
        string email
        string businessName
        string gstNumber
        string customerType
        string address
        string status
        datetime followUpDate
    }

    Product {
        string id PK
        string productCode UK
        string productName
        string sku UK
        float unitPrice
        int currentStock
        int minimumStock
        string warehouseId FK
        string categoryId FK
    }

    SalesChallan {
        string id PK
        string challanNumber UK
        string customerId FK
        string status
        int totalQuantity
        float totalAmount
        string createdBy FK
        string confirmedBy FK
        datetime confirmedAt
    }

    SalesChallanItem {
        string id PK
        string challanId FK
        string productId FK
        string productNameSnapshot
        string skuSnapshot
        float unitPriceSnapshot
        int quantity
        float lineTotal
    }

    Invoice {
        string id PK
        string invoiceNumber UK
        string challanId FK
        string customerId FK
        string status
        float subTotal
        float taxAmount
        float grandTotal
        datetime dueDate
        datetime issuedAt
    }
```

---

## 2. Entity Specifications & Field Indexes

### 1. User
- **Indexes**: `email` (Unique), `role`.
- **RBAC Roles**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.

### 2. Customer
- **Indexes**: `customerCode` (Unique), `customerName`, `mobile`, `email`, `status`, `customerType`.
- **Types**: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`.
- **Statuses**: `LEAD`, `ACTIVE`, `INACTIVE`.

### 3. Product
- **Indexes**: `sku` (Unique), `productCode` (Unique), `productName`, `categoryId`, `currentStock`.
- **Integrity**: `currentStock >= 0` enforced by transactional service guards and SQLite/PostgreSQL check constraints.

### 4. StockMovement
- **Indexes**: `productId`, `movementType`, `createdAt`, `referenceId`.
- **Types**: `IN` (Goods Receipt, Audit Add), `OUT` (Sales Challan Delivery, Adjustment).

### 5. SalesChallan & SalesChallanItem
- **Indexes**: `challanNumber` (Unique), `customerId`, `status`, `createdAt`.
- **Snapshot Pattern**: Line items store `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` immutably.

### 6. Invoice
- **Indexes**: `invoiceNumber` (Unique), `challanId` (Unique), `customerId`, `status`, `issuedAt`.
- **Statuses**: `ISSUED`, `PAID`, `CANCELLED`.
- **Integrity**: Directly derived from confirmed challans, preventing billing discrepancies.
