import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";
import { registerAuthRoutes } from "../server/_core/auth.js";
import { monthlyUrlCheckHandler } from "../server/cronHandler.js";
import {
  programSubmissionWebhookHandler,
  alertSubscriptionWebhookHandler,
} from "../server/webhookHandler.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS & Preflight handling
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Auth routes (login, register, logout)
registerAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Cron endpoint (protected by CRON_SECRET)
app.all("/api/cron/monthly-url-check", monthlyUrlCheckHandler);

// Webhook endpoints from GoHighLevel
app.all("/api/webhook/program-submission", programSubmissionWebhookHandler);
app.all("/api/webhook/alert-subscription", alertSubscriptionWebhookHandler);

export default app;
