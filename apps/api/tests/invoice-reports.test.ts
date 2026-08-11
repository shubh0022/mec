import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Tax Invoices & Real-time Reports Suite", () => {
  let adminToken: string;
  let accountsToken: string;
  let confirmedChallanId: string;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    adminToken = adminLogin.body.data.token;

    const accountsLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "accounts@example.com", password: "password123" });
    accountsToken = accountsLogin.body.data.token;

    // Fetch confirmed challan
    const challansRes = await request(app)
      .get("/api/challans?status=CONFIRMED")
      .set("Authorization", `Bearer ${adminToken}`);
    if (challansRes.body.data && challansRes.body.data.length > 0) {
      confirmedChallanId = challansRes.body.data[0].id;
    }
  });

  it("GET /api/reports/stock - Computes accurate stock asset valuation", async () => {
    const res = await request(app)
      .get("/api/reports/stock")
      .set("Authorization", `Bearer ${accountsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalValuation).toBeGreaterThan(0);
    expect(res.body.data.summary.totalUnits).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("GET /api/reports/sales - Computes sales revenue and top customer analytics", async () => {
    const res = await request(app)
      .get("/api/reports/sales")
      .set("Authorization", `Bearer ${accountsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalRevenue).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.topCustomers)).toBe(true);
    expect(Array.isArray(res.body.data.topProducts)).toBe(true);
  });

  it("GET /api/invoices - Lists GST tax invoices with pagination", async () => {
    const res = await request(app)
      .get("/api/invoices")
      .set("Authorization", `Bearer ${accountsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
