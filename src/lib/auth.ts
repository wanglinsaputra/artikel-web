import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getUserById, type User } from "./db";

const ADMIN_COOKIE = "admin_session";
const USER_COOKIE = "user_session";

function secret() {
  const s = process.env.SESSION_SECRET?.trim();
  if (s) return s;
  // Fail closed in production — never ship with a known default secret.
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return "dev-secret-ganti-ini";
}

function sign(value: string) {
  const sig = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

function unsign(token: string) {
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const value = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return value;
  } catch {
    return null;
  }
}

/** Same-origin path only. Blocks //evil.com open redirects. */
export function safeInternalPath(path: string, fallback = "/"): string {
  const raw = String(path || "").trim();
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  try {
    const u = new URL(raw, "http://local.invalid");
    if (u.origin !== "http://local.invalid") return fallback;
    return `${u.pathname}${u.search}${u.hash}` || fallback;
  } catch {
    return fallback;
  }
}

// In-memory login throttle (per instance). Best-effort on serverless.
// TODO(security): replace with Redis/Upstash (or edge rate-limit) for multi-instance production.
const loginHits = new Map<string, { n: number; t: number }>();

export async function allowLoginAttempt(bucket: string, max = 10, windowMs = 15 * 60 * 1000) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const cur = loginHits.get(key);
  if (!cur || now - cur.t > windowMs) {
    loginHits.set(key, { n: 1, t: now });
    return true;
  }
  if (cur.n >= max) return false;
  cur.n += 1;
  return true;
}

/** http(s) URL only — blocks javascript: / data: for stored links. */
export function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  return prev.length === next.length && timingSafeEqual(prev, next);
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sign("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  // TODO(security): panel auth is shared ADMIN_PASSWORD cookie, not users.role.
  // Manual: either drop users.role=admin or gate /asu via role + per-admin accounts.
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return unsign(token) === "admin";
}

export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  // No default password in production.
  if (!expected) {
    if (process.env.NODE_ENV === "production") return false;
    // dev-only fallback — set ADMIN_PASSWORD before deploy
    const dev = "admin123";
    const a = Buffer.from(password);
    const b = Buffer.from(dev);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setUserSession(userId: number) {
  const jar = await cookies();
  jar.set(USER_COOKIE, sign(String(userId)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (!token) return null;
  const id = unsign(token);
  if (!id) return null;
  const user = await getUserById(Number(id));
  if (!user || user.active === 0) return null;
  return user;
}

export function telegramOrderUrl(productTitle: string, customText?: string) {
  const username = (process.env.TELEGRAM_USERNAME || "your_telegram").replace(/^@/, "");
  const text = customText?.trim() || `Halo, saya mau order: ${productTitle}`;
  return `https://t.me/${username}?text=${encodeURIComponent(text)}`;
}
