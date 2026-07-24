import { NextResponse } from "next/server";
import { isAdmin, isSafeHttpUrl } from "@/lib/auth";
import {
  countShortlinks,
  createShortlink,
  listShortlinks,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const skip = (page - 1) * limit;

  try {
    const [total, items] = await Promise.all([
      countShortlinks({ q, status }),
      listShortlinks({ q, status, skip, limit }),
    ]);

    return NextResponse.json({
      ok: true,
      total,
      page,
      limit,
      data: items,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const target_url = String(payload.target_url || "").trim();
  const code = payload.code ? String(payload.code).trim() : undefined;
  const expires_at_raw = payload.expires_at ? String(payload.expires_at).trim() : undefined;
  const active = payload.active !== undefined ? Boolean(payload.active) : true;

  if (!target_url) {
    return NextResponse.json({ ok: false, error: "target_url_required" }, { status: 400 });
  }

  if (!isSafeHttpUrl(target_url)) {
    return NextResponse.json({ ok: false, error: "invalid_target_url" }, { status: 400 });
  }

  const expires_at = expires_at_raw ? new Date(expires_at_raw) : null;

  try {
    const item = await createShortlink({
      code,
      target_url,
      expires_at,
      active,
    });

    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal membuat shortlink.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
