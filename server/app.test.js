import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createDb } from "./lib/db.js";

async function testApp() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "civic-voice-"));
  const db = await createDb(path.join(directory, "db.json"));
  return { app: await createApp({ db }), db };
}

describe("CivicVoice baseline API", () => {
  it("creates a missing datastore directory on first use", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "civic-voice-"));
    const db = await createDb(path.join(directory, "missing", "data", "db.json"));
    expect(db.data.users).toHaveLength(2);
  });

  it("logs in the seeded citizen", async () => {
    const { app } = await testApp();
    const response = await request(app).post("/api/login").send({
      nric: "S0000001A", password: "citizen123", role: "citizen",
    });
    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("citizen");
  });

  it("rate-limits repeated failed sign-ins without blocking a valid sign-in", async () => {
    const app = await testApp();
    const invalidCredentials = { nric: "S0000001A", password: "wrong", role: "citizen" };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request(app).post("/api/login").send(invalidCredentials);
      expect(response.status).toBe(401);
    }

    const limited = await request(app).post("/api/login").send(invalidCredentials);
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/Too many failed sign-in attempts/i);
    expect(limited.headers["retry-after"]).toBeDefined();

    const successful = await request(app).post("/api/login").send({
      nric: "S0000001A", password: "citizen123", role: "citizen",
    });
    expect(successful.status).toBe(200);
    expect(successful.body.user.role).toBe("citizen");
  });

  it("accepts feedback", async () => {
    const { app } = await testApp();
    const response = await request(app).post("/api/feedback").send({
      nric: "S0000001A", name: "Aisha Rahman", message: "Please add more benches.",
    });
    expect(response.status).toBe(201);
    expect(response.body.feedback.message).toBe("Please add more benches.");
  });

  it("blocks the feedback list without the admin role header", async () => {
    const { app } = await testApp();
    const response = await request(app).get("/api/feedback");
    expect(response.status).toBe(403);
  });

  it("lists feedback newest first when stored data is out of order", async () => {
    const { app, db } = await testApp();
    db.data.feedback = [
      { id: "middle", createdAt: "2026-08-30T09:00:00.000Z" },
      { id: "oldest", createdAt: "2026-08-29T09:00:00.000Z" },
      { id: "newest", createdAt: "2026-08-31T09:00:00.000Z" },
    ];

    const response = await request(app).get("/api/feedback").set("x-user-role", "admin");

    expect(response.status).toBe(200);
    expect(response.body.feedback.map((item) => item.id)).toEqual(["newest", "middle", "oldest"]);
  });
});

describe("CV-024 admin API contract", () => {
  it("returns the admin identity and token after a successful admin sign-in", async () => {
    const { app } = await testApp();

    const response = await request(app).post("/api/login").send({
      nric: "S0000002B", password: "admin123", role: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      token: Buffer.from("S0000002B:admin").toString("base64"),
      user: { nric: "S0000002B", name: "Daniel Tan", role: "admin" },
    });
  });

  it("returns the inbox payload to an admin request", async () => {
    const { app } = await testApp();

    const response = await request(app)
      .get("/api/feedback")
      .set("x-user-role", "admin");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      feedback: [{
        id: "fb-seed-1",
        nric: "S0000001A",
        name: "Aisha Rahman",
        message: "The new sheltered walkway near the library is helpful, but the lights turn off too early.",
        category: "General",
        status: "New",
        createdAt: "2026-08-29T09:14:00.000Z",
      }],
    });
  });

  it("returns the forbidden-access contract to a citizen inbox request", async () => {
    const { app } = await testApp();

    const response = await request(app)
      .get("/api/feedback")
      .set("x-user-role", "citizen");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Admin access required." });
  });
});
