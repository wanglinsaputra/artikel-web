import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { getShortlinkByCode, recordShortlinkClick } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    notFound();
  }

  const link = await getShortlinkByCode(code);
  if (!link) {
    notFound();
  }

  const now = new Date();
  const isExpired = link.expires_at && new Date(link.expires_at) <= now;

  if (!link.active || isExpired) {
    notFound();
  }

  // Non-blocking async click logging to optimize redirect response speed
  if (link._id) {
    const referrer = req.headers.get("referer") || null;
    const userAgent = req.headers.get("user-agent") || null;
    void recordShortlinkClick({
      link_id: link._id,
      referrer,
      user_agent: userAgent,
    });
  }

  return NextResponse.redirect(link.target_url, 302);
}
