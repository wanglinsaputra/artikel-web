import { NextResponse } from "next/server";
import { bumpSectionView, isPortalSection } from "@/lib/db";

export const dynamic = "force-dynamic";

const COOKIE = "wl_sv";
const WINDOW_MS = 30 * 60 * 1000; // 30 min debounce per section

function parseSeen(raw: string | undefined): Record<string, number> {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const section =
    body && typeof body === "object" && "section" in body
      ? String((body as { section?: unknown }).section || "")
      : "";

  if (!isPortalSection(section)) {
    return NextResponse.json({ ok: false, error: "invalid_section" }, { status: 400 });
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]*)`));
  const seen = parseSeen(match?.[1] ? decodeURIComponent(match[1]) : undefined);
  const now = Date.now();
  const last = seen[section] || 0;

  if (now - last < WINDOW_MS) {
    return NextResponse.json({ ok: true, counted: false });
  }

  try {
    await bumpSectionView(section);
  } catch {
    return NextResponse.json({ ok: false, error: "db" }, { status: 503 });
  }

  seen[section] = now;
  // drop stale keys
  for (const k of Object.keys(seen)) {
    if (now - seen[k] > WINDOW_MS * 4) delete seen[k];
  }

  const res = NextResponse.json({ ok: true, counted: true });
  res.cookies.set(COOKIE, JSON.stringify(seen), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
