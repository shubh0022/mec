import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Production Authentication & Session Endpoints", () => {
  it("POST /api/auth/login - Successfully authenticates valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe("admin@example.com");
    expect(res.body.data.user.role).toBe("ADMIN");
  });

  it("POST /api/auth/login - Rejects invalid password with generic 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
    expect(res.body.message).toBe("Email or password is incorrect");
  });

  it("POST /api/auth/login - Rejects non-existent email with same generic 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email or password is incorrect");
  });

  it("POST /api/auth/guest - Creates isolated read-only guest demo session", async () => {
    const res = await request(app).post("/api/auth/guest");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe("GUEST");
    expect(res.body.data.isGuest).toBe(true);
    expect(res.body.data.expiresIn).toBeTruthy();
  });

  it("GUEST SECURITY: Guest can read dashboard and catalog records", async () => {
    const guestRes = await request(app).post("/api/auth/guest");
    const guestToken = guestRes.body.data.token;

    const customersRes = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(customersRes.status).toBe(200);

    const productsRes = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(productsRes.status).toBe(200);

    const dashboardRes = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(dashboardRes.status).toBe(200);
  });

  it("GUEST SECURITY: Guest cannot mutate customer records (Returns 403)", async () => {
    const guestRes = await request(app).post("/api/auth/guest");
    const guestToken = guestRes.body.data.token;

    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        customerName: "Illegal Guest Customer",
        mobile: "9876543210",
        businessName: "Guest Hack LLC",
        address: "Nowhere"
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("GUEST SECURITY: Guest cannot create stock movements (Returns 403)", async () => {
    const guestRes = await request(app).post("/api/auth/guest");
    const guestToken = guestRes.body.data.token;

    const res = await request(app)
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        productId: "dummy-id",
        quantity: 50,
        movementType: "IN",
        reason: "Unauthorized guest adjustment"
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("GUEST SECURITY: Guest cannot create or access user administration (Returns 403)", async () => {
    const guestRes = await request(app).post("/api/auth/guest");
    const guestToken = guestRes.body.data.token;

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("GET /api/auth/me - Returns 401 when token is missing", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me - Returns user profile when valid token provided", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "sales@example.com", password: "password123" });
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe("sales@example.com");
    expect(meRes.body.data.role).toBe("SALES");
  });

  it("POST /api/auth/logout - Successfully logs out authenticated user", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    const token = loginRes.body.data.token;

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });
});
