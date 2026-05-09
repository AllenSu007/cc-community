import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRouter } from "./routes/auth.js";
import { messagesRouter } from "./routes/messages.js";
import { tasksRouter } from "./routes/tasks.js";
import { paymentsRouter } from "./routes/payments.js";
import { errorHandler } from "./middleware/error.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "*", credentials: true }));

app.get("/health", (c) => c.json({ ok: true }));

app.route("/api/auth", authRouter);
app.route("/api/messages", messagesRouter);
app.route("/api/tasks", tasksRouter);
app.route("/api/payments", paymentsRouter);

app.onError(errorHandler);

const port = parseInt(process.env["PORT"] ?? "3001", 10);

serve({ fetch: app.fetch, port });
console.log(`🚀 API server running on http://localhost:${port}`);
