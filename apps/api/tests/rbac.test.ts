import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Role-Based Access Control (RBAC) Enforcement", () => {
  let salesToken: string;
  let warehouseToken: string;
  let accountsToken: string;

  beforeAll(async () => {
    const salesLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "sales@example.com", password: "password123" });
    salesToken = salesLogin.body.data.token;

    const warehouseLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "warehouse@example.com", password: "password123" });
    warehouseToken = warehouseLogin.body.data.token;

    const accountsLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "accounts@example.com", password: "password123" });
    accountsToken = accountsLogin.body.data.token;
  });

  it("RBAC: SALES cannot directly create arbitrary manual stock movements (Returns 403)", async () => {
    const res = await request(app)
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        productId: "dummy-id",
        quantity: 10,
        movementType: "IN",
        reason: "Unauthorized adjustment"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("RBAC: Non-admin users cannot access /api/users (Returns 403)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${salesToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("RBAC: ACCOUNTS cannot create new products (Returns 403)", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${accountsToken}`)
      .send({
        productName: "Test Product",
        sku: "TEST-SKU",
        unitPrice: 100
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});
