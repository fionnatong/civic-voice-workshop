import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { createDb } from "./lib/db.js";

export async function createApp(options = {}) {
  const db = options.db ?? (await createDb());
  const loginRateLimit = {
    maxFailedAttempts: options.loginRateLimit?.maxFailedAttempts ?? 5,
    windowMs: options.loginRateLimit?.windowMs ?? 15 * 60 * 1000,
  };
  const failedLoginAttempts = new Map();
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "civic-voice-api" });
  });

  app.post("/api/login", (req, res) => {
    const { nric, password, role } = req.body ?? {};
    const attemptKey = `${req.ip}:${String(nric ?? "").toUpperCase()}`;
    const now = Date.now();
    const attempts = (failedLoginAttempts.get(attemptKey) ?? []).filter(
      (attemptedAt) => now - attemptedAt < loginRateLimit.windowMs,
    );
    const user = db.data.users.find(
      (candidate) => candidate.nric === nric && candidate.password === password && candidate.role === role,
    );
    if (!user) {
      if (attempts.length >= loginRateLimit.maxFailedAttempts) {
        const retryAfterSeconds = Math.ceil((loginRateLimit.windowMs - (now - attempts[0])) / 1000);
        res.set("Retry-After", String(retryAfterSeconds));
        return res.status(429).json({
          error: "Too many failed sign-in attempts. Please wait a few minutes before trying again.",
          retryAfterSeconds,
        });
      }
      failedLoginAttempts.set(attemptKey, [...attempts, now]);
      return res.status(401).json({ error: "Invalid NRIC, password, or sign-in mode." });
    }

    // A valid credential proves the user is no longer making failed attempts.
    // Let it through and reset its failure history, even after a prior lockout.
    failedLoginAttempts.delete(attemptKey);

    // Workshop baseline only: this is deliberately not a production session.
    const token = Buffer.from(`${user.nric}:${user.role}`).toString("base64");
    return res.json({ token, user: { nric: user.nric, name: user.name, role: user.role } });
  });

  app.get("/api/feedback", (req, res) => {
    if (req.header("x-user-role") !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const feedback = [...db.data.feedback].sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );
    return res.json({ feedback });
  });

  app.post("/api/feedback", async (req, res) => {
    const { nric, name, message } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter feedback." });
    }
    const feedback = {
      id: crypto.randomUUID(), nric, name, message, category: "General", status: "New",
      createdAt: new Date().toISOString(),
    };
    db.data.feedback.unshift(feedback);
    await db.write();
    return res.status(201).json({ feedback });
  });

  return app;
}
