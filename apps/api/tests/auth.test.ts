import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Authentication & Session Endpoints", () => {
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

  it("POST /api/auth/login - Rejects invalid password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
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
});
