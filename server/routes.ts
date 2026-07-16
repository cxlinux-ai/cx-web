import type { Express, Request } from "express";
import { createServer, type Server } from "http";

// Helper to extract client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

import stripeRoutes from "./stripe";
import emailCaptureRoutes from "./email-capture";

// Keep-alive: Self-ping to prevent sleep
const SELF_PING_INTERVAL = 4 * 60 * 1000; // 4 minutes
let keepAliveInterval: NodeJS.Timeout | null = null;

function startKeepAlive(baseUrl: string) {
  if (keepAliveInterval) return;

  keepAliveInterval = setInterval(async () => {
    try {
      await fetch(`${baseUrl}/api/health`);
      console.log("[Keep-Alive] Ping successful");
    } catch (error) {
      console.log("[Keep-Alive] Ping failed, will retry");
    }
  }, SELF_PING_INTERVAL);

  console.log("[Keep-Alive] Self-ping started (every 4 minutes)");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Start keep-alive on first request
  app.use((req, res, next) => {
    if (!keepAliveInterval) {
      const protocol = req.protocol;
      const host = req.get("host");
      if (host) {
        startKeepAlive(`${protocol}://${host}`);
      }
    }
    next();
  });

  // Mount Stripe routes
  app.use("/api/stripe", stripeRoutes);

  // Mount Email Capture routes
  app.use(emailCaptureRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
