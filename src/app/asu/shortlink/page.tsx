import { redirect } from "next/navigation";
import { AdminListToolbar, AdminPagination } from "@/components/admin-list-controls";
import { ShortlinkItemCard } from "@/components/shortlink-item-card";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_PAGE_SIZE, clampAdminPage, parseAdminListQuery } from "@/lib/admin-query";
import { isSafeHttpUrl } from "@/lib/auth";
import {
  countShortlinks,
  createShortlink,
  deleteShortlink,
  listShortlinks,
  updateShortlink,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel Shortlink" };

export default async function PanelShortlinkPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; status?: string; error?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const query = parseAdminListQuery(sp);
  const errorMessage = sp.error ? decodeURIComponent(sp.error) : null;

  const listOpts = {
    q: query.q || undefined,
    sort: query.sort,
    status: query.status,
  };
  const total = await countShortlinks(listOpts);
  const page = clampAdminPage(query.page, total);
  const items = await listShortlinks({
    ...listOpts,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    limit: ADMIN_PAGE_SIZE,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  async function createShortlinkAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const target_url = String(formData.get("target_url") || "").trim();
    const custom_code = String(formData.get("custom_code") || "").trim();
    const expires_at_raw = String(formData.get("expires_at") || "").trim();
    const active = formData.get("active") !== null;

    if (!target_url) {
      redirect("/asu/shortlink?error=" + encodeURIComponent("URL Target wajib diisi."));
    }
    if (!isSafeHttpUrl(target_url)) {
      redirect("/asu/shortlink?error=" + encodeURIComponent("URL tidak valid. Harus diawali http:// atau https://"));
    }

    const expires_at = expires_at_raw ? new Date(expires_at_raw) : null;

    try {
      await createShortlink({
        code: custom_code || undefined,
        target_url,
        expires_at,
        active,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat shortlink.";
      redirect("/asu/shortlink?error=" + encodeURIComponent(msg));
    }

    redirect("/asu/shortlink");
  }

  async function deleteShortlinkAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = String(formData.get("id") || "");
    await deleteShortlink(id);
    redirect("/asu/shortlink");
  }

  async function toggleActiveAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = String(formData.get("id") || "");
    const currentActive = formData.get("active") === "true";
    await updateShortlink(id, { active: !currentActive });
    redirect("/asu/shortlink");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="URL Shortener" description="Kelola tautan singkat wanglin.web.id/{code} dan pantau jumlah klik." />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400">
          ⚠️ {errorMessage}
        </div>
      ) : null}

      <Card hover={false}>
        <h2 className="text-lg font-semibold text-primary">Buat Shortlink Baru</h2>
        <form action={createShortlinkAction} className="mt-4 grid gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              URL Target <span className="text-red-400">*</span>
            </label>
            <input
              name="target_url"
              type="url"
              placeholder="https://example.com/halaman-tujuan-panjang"
              required
              className="field w-full"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                Custom Kode Shortlink (Opsional)
              </label>
              <input
                name="custom_code"
                placeholder="Kosongkan untuk random (mis. aB3xZ9)"
                className="field w-full font-mono text-sm"
              />
              <p className="mt-1 text-[11px] text-muted">
                Kosongkan untuk acak 6 karakter, atau isi sendiri (bebas huruf/angka, misal: promo2026).
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                Tanggal Kadaluarsa (Opsional)
              </label>
              <input
                name="expires_at"
                type="datetime-local"
                className="field w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" name="active" defaultChecked className="rounded border-border bg-base text-accent" />
              Aktifkan Shortlink
            </label>

            <button type="submit" className="btn-primary min-h-11 px-6">
              Simpan Shortlink
            </button>
          </div>
        </form>
      </Card>

      <section className="space-y-4" aria-labelledby="shortlink-list-heading">
        <h2 id="shortlink-list-heading" className="text-lg font-semibold text-primary">
          Daftar Shortlink ({total})
        </h2>
        <AdminListToolbar
          basePath="/asu/shortlink"
          q={query.q}
          sort={query.sort}
          status={query.status}
          total={total}
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
        />

        {items.length === 0 ? (
          <EmptyState text={query.q || query.status !== "all" ? "Tidak ada shortlink yang cocok." : "Belum ada shortlink."} />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <ShortlinkItemCard
                key={String(item._id)}
                item={{
                  _id: String(item._id),
                  code: item.code,
                  target_url: item.target_url,
                  click_count: item.click_count,
                  created_at: item.created_at,
                  expires_at: item.expires_at,
                  active: item.active,
                }}
                baseUrl={baseUrl}
                toggleActiveAction={toggleActiveAction}
                deleteShortlinkAction={deleteShortlinkAction}
              />
            ))}
          </div>
        )}

        <AdminPagination
          basePath="/asu/shortlink"
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
          total={total}
          q={query.q}
          sort={query.sort}
          status={query.status}
        />
      </section>
    </div>
  );
}
