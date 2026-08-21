import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { registerAuthRoutes } from "./auth.js";
import { monthlyUrlCheckHandler } from "../cronHandler.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
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
  app.all("/api/cron/monthly-url-check", monthlyUrlCheckHandler);

  // In development, proxy to Vite. In production, serve built assets.
  if (process.env.NODE_ENV === "development") {
    const fs = await import("node:fs");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      try {
        const indexPath = path.resolve(process.cwd(), "client/index.html");
        let template = await fs.promises.readFile(indexPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, "../../dist/public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = parseInt(process.env.PORT ?? "3001");
  const server = createServer(app);
  server.listen(port, "0.0.0.0", () => {
    console.log(`\n🏒 Lambton County Sports running at http://localhost:${port}`);
    console.log(`   Admin: http://localhost:${port}/admin\n`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});

