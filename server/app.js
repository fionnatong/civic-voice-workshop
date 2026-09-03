import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { createDb } from "./lib/db.js";

function filterFeedback(feedback, query) {
  return feedback.filter((item) => (
    (!query.category || item.category === query.category)
    && (!query.status || item.status === query.status)
  ));
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function feedbackCsv(feedback) {
  const columns = [
    ["Reference", "id"],
    ["NRIC", "nric"],
    ["Name", "name"],
    ["Category", "category"],
    ["Status", "status"],
    ["Feedback", "message"],
    ["Received at", "createdAt"],
  ];
  const rows = [columns.map(([title]) => title), ...feedback.map((item) => columns.map(([, key]) => item[key]))];
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export async function createApp(options = {}) {
  const db = options.db ?? (await createDb());
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "civic-voice-api" });
  });

  app.post("/api/login", (req, res) => {
    const { nric, password, role } = req.body ?? {};
    const user = db.data.users.find(
      (candidate) => candidate.nric === nric && candidate.password === password && candidate.role === role,
    );
    if (!user) return res.status(401).json({ error: "Invalid NRIC, password, or sign-in mode." });

    // Workshop baseline only: this is deliberately not a production session.
    const token = Buffer.from(`${user.nric}:${user.role}`).toString("base64");
    return res.json({ token, user: { nric: user.nric, name: user.name, role: user.role } });
  });

  app.get("/api/feedback", (req, res) => {
    if (req.header("x-user-role") !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    return res.json({ feedback: db.data.feedback });
  });

  app.get("/api/feedback/export", (req, res) => {
    if (req.header("x-user-role") !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const feedback = filterFeedback(db.data.feedback, req.query);
    res
      .type("text/csv")
      .attachment("civic-voice-feedback.csv")
      .send(feedbackCsv(feedback));
  });

  app.post("/api/feedback", async (req, res) => {
    const { nric, name, message } = req.body ?? {};
    if (!message) return res.status(400).json({ error: "Please enter feedback." });
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
