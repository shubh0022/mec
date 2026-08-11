import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Business Logic & Stock Transaction Rules", () => {
  let adminToken: string;
  let salesToken: string;
  let warehouseToken: string;
  let testCustomerId: string;
  let testProductId: string;

  beforeAll(async () => {
    // 1. Authenticate demo users
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    adminToken = adminLogin.body.data.token;

    const salesLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "sales@example.com", password: "password123" });
    salesToken = salesLogin.body.data.token;

    const warehouseLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "warehouse@example.com", password: "password123" });
    warehouseToken = warehouseLogin.body.data.token;

    // 2. Create dedicated customer for test
    const custRes = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        customerName: "Apex Retail Test",
        businessName: "Apex Retail Ltd",
        mobile: "9988776655",
        address: "Industrial Area Phase 1",
        customerType: "WHOLESALE"
      });
    testCustomerId = custRes.body.data.id;

    // 3. Create test product with EXACTLY 5 units in stock
    const prodRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${warehouseToken}`)
      .send({
        productName: "Precision Test Bearing",
        sku: `BRG-TEST-${Date.now()}`,
        unitPrice: 1500,
        currentStock: 5,
        minimumStock: 2
      });
    testProductId = prodRes.body.data.id;
  });

  it("MANDATORY TEST: Insufficient Stock Rollback Rule (Stock = 5, Request = 6 -> 409 Conflict, Stock remains 5, Challan remains DRAFT, 0 OUT movements)", async () => {
    // Step 1: Verify baseline stock is 5
    const initialProduct = await prisma.product.findUnique({ where: { id: testProductId } });
    expect(initialProduct?.currentStock).toBe(5);

    const initialMovementCount = await prisma.stockMovement.count({
      where: { productId: testProductId, movementType: "OUT" }
    });

    // Step 2: Create a draft challan requesting 6 units
    const draftRes = await request(app)
      .post("/api/challans")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        customerId: testCustomerId,
        notes: "Urgent shipment test",
        items: [{ productId: testProductId, quantity: 6 }]
      });

    expect(draftRes.status).toBe(201);
    const challanId = draftRes.body.data.id;
    expect(draftRes.body.data.status).toBe("DRAFT");
    expect(draftRes.body.data.totalQuantity).toBe(6);

    // Step 3: Attempt to confirm the challan
    const confirmRes = await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set("Authorization", `Bearer ${salesToken}`);

    // MUST FAIL with 409 Conflict
    expect(confirmRes.status).toBe(409);
    expect(confirmRes.body.success).toBe(false);
    expect(confirmRes.body.code).toBe("INSUFFICIENT_STOCK");

    // Step 4: Verify stock has NOT changed and is still 5
    const productAfter = await prisma.product.findUnique({ where: { id: testProductId } });
    expect(productAfter?.currentStock).toBe(5);

    // Step 5: Verify Challan remains in DRAFT status
    const challanAfter = await prisma.salesChallan.findUnique({ where: { id: challanId } });
    expect(challanAfter?.status).toBe("DRAFT");
    expect(challanAfter?.confirmedAt).toBeNull();
    expect(challanAfter?.confirmedBy).toBeNull();

    // Step 6: Verify NO OUT stock movement was recorded
    const finalMovementCount = await prisma.stockMovement.count({
      where: { productId: testProductId, movementType: "OUT" }
    });
    expect(finalMovementCount).toBe(initialMovementCount);
  });

  it("SUCCESSFUL CHALLAN CONFIRMATION: Correct stock deduction (Stock = 5, Request = 3 -> Confirmed, Stock = 2, OUT movement created)", async () => {
    // Step 1: Create a draft challan requesting 3 units (within available 5)
    const draftRes = await request(app)
      .post("/api/challans")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        customerId: testCustomerId,
        notes: "Valid quantity challan",
        items: [{ productId: testProductId, quantity: 3 }]
      });

    expect(draftRes.status).toBe(201);
    const challanId = draftRes.body.data.id;

    // Step 2: Confirm challan
    const confirmRes = await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set("Authorization", `Bearer ${salesToken}`);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe("CONFIRMED");
    expect(confirmRes.body.data.confirmedAt).toBeTruthy();

    // Step 3: Verify stock deducted (5 - 3 = 2)
    const productAfter = await prisma.product.findUnique({ where: { id: testProductId } });
    expect(productAfter?.currentStock).toBe(2);

    // Step 4: Verify OUT movement was recorded
    const outMovement = await prisma.stockMovement.findFirst({
      where: { productId: testProductId, referenceId: challanId, movementType: "OUT" }
    });
    expect(outMovement).toBeTruthy();
    expect(outMovement?.quantity).toBe(3);
  });

  it("SNAPSHOT INTEGRITY: Modifying current product price does not alter historical challan line total", async () => {
    // 1. Create and confirm a challan at unit price 1500
    const draftRes = await request(app)
      .post("/api/challans")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 1 }]
      });
    const challanId = draftRes.body.data.id;

    await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set("Authorization", `Bearer ${salesToken}`);

    // 2. Change product price from 1500 to 9999
    await request(app)
      .patch(`/api/products/${testProductId}`)
      .set("Authorization", `Bearer ${warehouseToken}`)
      .send({ unitPrice: 9999 });

    // 3. Fetch historic challan and verify snapshot price is still 1500 and lineTotal is 1500
    const fetchedChallan = await request(app)
      .get(`/api/challans/${challanId}`)
      .set("Authorization", `Bearer ${salesToken}`);

    expect(fetchedChallan.status).toBe(200);
    expect(fetchedChallan.body.data.items[0].unitPriceSnapshot).toBe(1500);
    expect(fetchedChallan.body.data.items[0].lineTotal).toBe(1500);
  });
});
