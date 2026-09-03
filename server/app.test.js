import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createDb } from "./lib/db.js";

async function testApp(feedback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "civic-voice-"));
  const db = await createDb(path.join(directory, "db.json"));
  if (feedback) db.data.feedback = feedback;
  return createApp({ db });
}

describe("CivicVoice baseline API", () => {
  it("creates a missing datastore directory on first use", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "civic-voice-"));
    const db = await createDb(path.join(directory, "missing", "data", "db.json"));
    expect(db.data.users).toHaveLength(2);
  });

  it("logs in the seeded citizen", async () => {
    const app = await testApp();
    const response = await request(app).post("/api/login").send({
      nric: "S0000001A", password: "citizen123", role: "citizen",
    });
    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("citizen");
  });

  it("accepts feedback", async () => {
    const app = await testApp();
    const response = await request(app).post("/api/feedback").send({
      nric: "S0000001A", name: "Aisha Rahman", message: "Please add more benches.",
    });
    expect(response.status).toBe(201);
    expect(response.body.feedback.message).toBe("Please add more benches.");
  });

  it("blocks the feedback list without the admin role header", async () => {
    const app = await testApp();
    const response = await request(app).get("/api/feedback");
    expect(response.status).toBe(403);
  });

  it("exports only the requested category and status as CSV", async () => {
    const app = await testApp([
      { id: "estate-new", nric: "S1", name: "A", category: "Estate", status: "New", message: "Match", createdAt: "2026-09-01T00:00:00.000Z" },
      { id: "transport-new", nric: "S2", name: "B", category: "Transport", status: "New", message: "Wrong category", createdAt: "2026-09-01T00:00:00.000Z" },
      { id: "estate-closed", nric: "S3", name: "C", category: "Estate", status: "Closed", message: "Wrong status", createdAt: "2026-09-01T00:00:00.000Z" },
    ]);
    const response = await request(app)
      .get("/api/feedback/export?category=Estate&status=New")
      .set("x-user-role", "admin");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.headers["content-disposition"]).toContain("civic-voice-feedback.csv");
    expect(response.text).toContain("estate-new,S1,A,Estate,New,Match,2026-09-01T00:00:00.000Z");
    expect(response.text).not.toContain("transport-new");
    expect(response.text).not.toContain("estate-closed");
  });

  it("quotes commas, quotes, and newlines in CSV exports", async () => {
    const dbFeedback = {
      id: "fb-csv-1",
      nric: "S0000001A",
      name: "Tan, Mei",
      category: "Estate",
      status: "New",
      message: "Please fix the \"broken\" lift,\nbefore Friday.",
      createdAt: "2026-09-01T10:00:00.000Z",
    };
    const app = await testApp([dbFeedback]);
    const response = await request(app).get("/api/feedback/export").set("x-user-role", "admin");

    expect(response.text).toContain('fb-csv-1,S0000001A,"Tan, Mei",Estate,New,"Please fix the ""broken"" lift,\nbefore Friday.",2026-09-01T10:00:00.000Z');
  });

  it("blocks CSV exports without the admin role header", async () => {
    const app = await testApp();
    const response = await request(app).get("/api/feedback/export");
    expect(response.status).toBe(403);
  });
});
