import { NextResponse } from "next/server";
import { isAdmin, isSafeHttpUrl } from "@/lib/auth";
import { deleteShortlink, getShortlinkById, updateShortlink } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getShortlinkById(id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not Found" }, { status: 404 });
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
  const updates: Parameters<typeof updateShortlink>[1] = {};

  if (payload.target_url !== undefined) {
    const target_url = String(payload.target_url).trim();
    if (!target_url || !isSafeHttpUrl(target_url)) {
      return NextResponse.json({ ok: false, error: "invalid_target_url" }, { status: 400 });
    }
    updates.target_url = target_url;
  }

  if (payload.code !== undefined) {
    updates.code = String(payload.code).trim();
  }

  if (payload.active !== undefined) {
    updates.active = Boolean(payload.active);
  }

  if (payload.expires_at !== undefined) {
    updates.expires_at = payload.expires_at ? new Date(String(payload.expires_at)) : null;
  }

  try {
    const success = await updateShortlink(id, updates);
    if (!success) {
      return NextResponse.json({ ok: false, error: "Update failed" }, { status: 400 });
    }
    const updatedDoc = await getShortlinkById(id);
    return NextResponse.json({ ok: true, data: updatedDoc });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui shortlink.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getShortlinkById(id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not Found" }, { status: 404 });
  }

  try {
    const success = await deleteShortlink(id);
    return NextResponse.json({ ok: success });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus shortlink.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
