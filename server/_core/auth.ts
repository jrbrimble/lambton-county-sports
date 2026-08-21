/**
 * Custom JWT-based authentication.
 * Replaces the Manus OAuth SDK with standard email/password flow.
 */
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS, UNAUTHED_ERR_MSG } from "../../shared/const.js";
import { parse as parseCookieHeader } from "cookie";
import * as db from "../db.js";
import { ENV } from "./env.js";
import type { User } from "../../drizzle/schema.js";

function getSecretKey() {
  if (!ENV.cookieSecret) throw new Error("JWT_SECRET env var is not set");
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(
  userId: number,
  email: string
): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .setIssuedAt()
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<{ userId: number; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const { userId, email } = payload as Record<string, unknown>;
    if (typeof userId !== "number" || typeof email !== "string") return null;
    return { userId, email };
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Map<string, string> {
  const header = req.headers.cookie;
  if (!header) return new Map();
  const parsed = parseCookieHeader(header);
  const map = new Map<string, string>();
  for (const [key, val] of Object.entries(parsed)) {
    if (val !== undefined) map.set(key, val);
  }
  return map;
}

/** Resolves the current user from the session cookie. Returns null if not authenticated. */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  const cookies = parseCookies(req);
  const token = cookies.get(COOKIE_NAME);
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await db.getUserById(session.userId);
  return user ?? null;
}

export function getSessionCookieOptions(req: Request) {
  const isSecure =
    req.protocol === "https" ||
    (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim() === "https";
  return {
    httpOnly: true,
    path: "/",
    sameSite: (isSecure ? "none" : "lax") as "none" | "lax",
    secure: isSecure,
  };
}

/** Express route handlers for auth endpoints */
export function registerAuthRoutes(app: import("express").Express) {
  // POST /api/auth/register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body as {
        email?: string;
        password?: string;
        name?: string;
      };

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const existing = await db.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      const passwordHash = await hashPassword(password);
      const isOwner = ENV.ownerEmail && email.toLowerCase() === ENV.ownerEmail.toLowerCase();
      const userId = await db.createUser({
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        role: isOwner ? "admin" : "user",
      });

      const token = await createSessionToken(userId, email.toLowerCase());
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (err) {
      console.error("[Auth] Register error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Upgrade to admin if email matches owner
      if (user.role !== "admin" && ENV.ownerEmail && email.toLowerCase() === ENV.ownerEmail.toLowerCase()) {
        await db.updateUserRole(user.id, "admin");
      }

      await db.updateLastSignedIn(user.id);

      const token = await createSessionToken(user.id, user.email);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (err) {
      console.error("[Auth] Login error:", err);
      console.error(err); res.status(500).json({ error: "Login failed: " + ((err as Error).message || String(err)) });
    }
  });
}
