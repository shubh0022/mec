# VANTA ERP — Business Workflows & Transaction Lifecycles

## 1. Wholesale Operations Lifecycle

```
[1. CRM & Lead Discovery]
  Sales representative registers Wholesale / Distributor client with GSTIN & Address.
       │
       ▼
[2. CRM Follow-Up Management]
  Sales team logs notes and schedules next contact dates (non-destructive audit history).
       │
       ▼
[3. Multi-Item Sales Challan Creation]
  Sales user drafts delivery voucher with real-time warehouse stock indicators.
       │
       ▼
[4. Transactional Confirmation & Stock Deduction]
  Sales / Admin confirms challan:
  - Database locks product rows in interactive transaction.
  - Verifies currentStock >= quantity for EVERY item.
  - Deducts inventory and logs OUT stock movements.
  - Transitions Challan from DRAFT -> CONFIRMED.
       │
       ▼
[5. Tax Invoicing & Billing]
  Accounts team generates GST tax invoice bound to confirmed delivery challan.
       │
       ▼
[6. Executive Reporting]
  Live stock asset valuation and sales performance dashboards update instantly.
```

---

## 2. Transactional Stock Safety & Rollback Flow

```mermaid
sequenceDiagram
    autonumber
    actor Sales as Sales / Admin
    participant API as Express API
    participant Tx as Prisma $transaction
    participant DB as Database Engine

    Sales->>API: POST /api/challans/:id/confirm
    API->>Tx: Begin Interactive Transaction
    Tx->>DB: Fetch Challan & Items (Validate Status == DRAFT)
    Tx->>DB: Check Stock for Item 1 (e.g. Req: 4, Avail: 10) -> OK
    Tx->>DB: Check Stock for Item 2 (e.g. Req: 7, Avail: 5) -> SHORTAGE

    alt Insufficient Inventory Detected
        Tx-->>DB: ROLLBACK Transaction
        Tx-->>API: Throw InsufficientStockError
        API-->>Sales: Return HTTP 409 Conflict (Stock = 5, Challan = DRAFT, 0 Movements)
    else Sufficient Inventory for All Items
        Tx->>DB: Update Product Stock Levels
        Tx->>DB: Create OUT Stock Movements
        Tx->>DB: Update Challan to CONFIRMED
        Tx->>DB: Create Audit Log
        Tx-->>DB: COMMIT Transaction
        API-->>Sales: Return HTTP 200 OK (Dispatched)
    end
```

---

## 3. Cancellation & Reversal Business Rules

1. **Draft Challan Cancellation**: Transitions state from `DRAFT` $\rightarrow$ `CANCELLED`. Zero inventory adjustments are made.
2. **Confirmed Challan Cancellation**: Transitions state from `CONFIRMED` $\rightarrow$ `CANCELLED`. Transactionally restores previously deducted stock and creates reversing `IN` stock movement ledger entries.
3. **Immutable State Protection**: Once an invoice is generated or a challan is cancelled, invalid transitions (e.g. `CANCELLED` $\rightarrow$ `CONFIRMED`) are rejected with `HTTP 409 Conflict`.
