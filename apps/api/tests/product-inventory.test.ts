import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Product Catalog & Inventory Ledger Safety Suite", () => {
  let warehouseToken: string;
  let productId: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "warehouse@example.com", password: "password123" });
    warehouseToken = loginRes.body.data.token;
  });

  it("POST /api/products - Registers product and rejects duplicate SKU", async () => {
    const sku = `BRG-${Date.now().toString().slice(-4)}`;
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${warehouseToken}`)
      .send({
        productName: "High Temp Roller Bearing",
        sku,
        unitPrice: 1250,
        currentStock: 20,
        minimumStock: 5
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    productId = res.body.data.id;

    // Attempt duplicate SKU creation
    const dupRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${warehouseToken}`)
      .send({
        productName: "Duplicate SKU Bearing",
        sku,
        unitPrice: 1250,
        currentStock: 10,
        minimumStock: 5
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.code).toBe("CONFLICT");
  });

  it("POST /api/stock/movements - Processes Stock IN adjustment", async () => {
    const res = await request(app)
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${warehouseToken}`)
      .send({
        productId,
        quantity: 15,
        movementType: "IN",
        reason: "Supplier shipment PO-771 receipt"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quantity).toBe(15);
    expect(res.body.data.movementType).toBe("IN");

    // Verify product stock increased
    const prodRes = await request(app)
      .get(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${warehouseToken}`);
    expect(prodRes.body.data.currentStock).toBe(35); // 20 + 15
  });

  it("POST /api/stock/movements - Prevents negative stock on excess manual Stock OUT", async () => {
    // Current stock is 35. Attempting to withdraw 50.
    const res = await request(app)
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${warehouseToken}`)
      .send({
        productId,
        quantity: 50,
        movementType: "OUT",
        reason: "Excess stock withdrawal attempt"
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("INSUFFICIENT_STOCK");
  });
});
