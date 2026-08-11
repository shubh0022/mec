import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Customer CRM & Follow-up History Suite", () => {
  let salesToken: string;
  let createdCustomerId: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "sales@example.com", password: "password123" });
    salesToken = loginRes.body.data.token;
  });

  it("POST /api/customers - Creates a new customer with auto-generated customerCode", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        customerName: "Kalyan Heavy Engineering",
        businessName: "Kalyan Heavy Fab Works Ltd",
        mobile: "+91 98330 22119",
        email: "kalyan@kalyanfab.in",
        customerType: "WHOLESALE",
        address: "Plot 45, MIDC Ambernath, Thane 421501",
        status: "ACTIVE",
        gstNumber: "27AABCK4411D1Z8"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customerCode).toMatch(/^CUST-\d+/);
    expect(res.body.data.customerName).toBe("Kalyan Heavy Engineering");
    createdCustomerId = res.body.data.id;
  });

  it("GET /api/customers - Searches and filters customers by name", async () => {
    const res = await request(app)
      .get("/api/customers?search=Kalyan")
      .set("Authorization", `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].customerName).toContain("Kalyan");
  });

  it("POST /api/customers/:id/follow-ups - Adds non-destructive follow-up history record", async () => {
    const followUpRes = await request(app)
      .post(`/api/customers/${createdCustomerId}/follow-ups`)
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        note: "Discussed Q4 bulk pipe requirements over phone.",
        followUpDate: "2026-06-15T10:00:00Z"
      });

    expect(followUpRes.status).toBe(201);
    expect(followUpRes.body.success).toBe(true);
    expect(followUpRes.body.data.note).toContain("Discussed Q4 bulk pipe");

    // Verify history contains the follow-up
    const listRes = await request(app)
      .get(`/api/customers/${createdCustomerId}/follow-ups`)
      .set("Authorization", `Bearer ${salesToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
