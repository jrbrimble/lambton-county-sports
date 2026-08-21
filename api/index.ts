import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";
import { registerAuthRoutes } from "../server/_core/auth.js";
import { monthlyUrlCheckHandler } from "../server/cronHandler.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
app.post("/api/cron/monthly-url-check", monthlyUrlCheckHandler);

export default app;
