import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminListToolbar, AdminPagination } from "@/components/admin-list-controls";
import { CoverImage } from "@/components/cover-image";
import { ImageUrlField } from "@/components/image-url-field";
import { Badge, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_PAGE_SIZE, clampAdminPage, parseAdminListQuery } from "@/lib/admin-query";
import { isSafeHttpUrl } from "@/lib/auth";
import {
  countBansos,
  createBansos,
  deleteBansos,
  listBansos,
  setBansosPublished,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel Bansos" };

export default async function PanelBansosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const query = parseAdminListQuery(sp);
  const listOpts = {
    q: query.q || undefined,
    sort: query.sort,
    status: query.status,
  };
  const total = await countBansos(listOpts);
  const page = clampAdminPage(query.page, total);
  const items = await listBansos({
    ...listOpts,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    limit: ADMIN_PAGE_SIZE,
  });

  async function createItem(formData: FormData) {
    "use server";
    await requireAdmin();
    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const provider = String(formData.get("provider") || "").trim();
    const category = String(formData.get("category") || "Free Credit").trim() || "Free Credit";
    const image_url = String(formData.get("image_url") || "").trim();
    const valid_until = String(formData.get("valid_until") || "").trim() || null;
    const actionUrl = String(formData.get("actionUrl") || "").trim();
    const actionLabel = String(formData.get("actionLabel") || "").trim();
    const requires_login = formData.get("requires_login") ? 1 : 0;
    const is_hot = formData.get("is_hot") ? 1 : 0;
    const published = formData.get("published") ? 1 : 0;
    if (!title) redirect("/asu/bansos");
    if (image_url && !isSafeHttpUrl(image_url)) redirect("/asu/bansos");
    if (actionUrl && !isSafeHttpUrl(actionUrl)) redirect("/asu/bansos");
    await createBansos({
      title,
      excerpt,
      content,
      provider,
      category,
      image_url,
      requires_login,
      is_hot,
      valid_until,
      published,
      ...(actionUrl ? { actionUrl } : {}),
      ...(actionLabel ? { actionLabel } : {}),
    });
    redirect("/asu/bansos");
  }

  async function deleteItem(formData: FormData) {
    "use server";
    await requireAdmin();
    await deleteBansos(Number(formData.get("id")));
    redirect("/asu/bansos");
  }

  async function togglePublish(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    const published = Number(formData.get("published")) ? 0 : 1;
    await setBansosPublished(id, published);
    redirect("/asu/bansos");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Bansos AI" description="Gambar via link. Centang Login dulu untuk wall." />

      <Card hover={false}>
        <h2 className="text-lg font-semibold text-primary">Tambah bansos</h2>
        <form action={createItem} className="mt-4 grid gap-3">
          <input name="title" placeholder="Judul" required className="field" />
          <input name="provider" placeholder="Provider" className="field" />
          <input name="category" placeholder="Kategori (Free Credit, API, ...)" className="field" />
          <ImageUrlField />
          <input name="valid_until" placeholder="Berlaku sampai (YYYY-MM-DD)" className="field" />
          <input name="excerpt" placeholder="Ringkasan / preview" className="field" />
          <textarea name="content" placeholder="Detail lengkap" rows={6} className="field" />
          <input
            name="actionUrl"
            type="url"
            inputMode="url"
            placeholder="Official Link (https://...)"
            className="field"
          />
          <input
            name="actionLabel"
            placeholder="Button Label (default: Open Website)"
            className="field"
            maxLength={80}
          />
          <div className="flex flex-wrap gap-4 text-sm text-secondary">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requires_login" /> Login dulu
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_hot" /> Hot
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="published" defaultChecked /> Publish
            </label>
          </div>
          <button type="submit" className="btn-primary w-fit min-h-11">
            Simpan
          </button>
        </form>
      </Card>

      <section className="space-y-4" aria-labelledby="bansos-list-heading">
        <h2 id="bansos-list-heading" className="text-lg font-semibold text-primary">
          Daftar bansos
        </h2>
        <AdminListToolbar
          basePath="/asu/bansos"
          q={query.q}
          sort={query.sort}
          status={query.status}
          total={total}
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
        />
        {items.length === 0 ? (
          <EmptyState text={query.q || query.status !== "all" ? "Tidak ada bansos yang cocok." : "Belum ada bansos."} />
        ) : (
          <div className="space-y-3">
            {items.map((b) => (
              <Card key={b.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  {b.image_url ? (
                    <CoverImage src={b.image_url} alt={b.title} className="h-16 w-24 shrink-0 object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{b.category}</Badge>
                      {b.requires_login || b.is_hot ? (
                        <StatusBadge requiresLogin={b.requires_login} isHot={b.is_hot} />
                      ) : !b.published ? (
                        <Badge tone="hot">Draft</Badge>
                      ) : null}
                      {b.published ? (
                        <Badge>Published</Badge>
                      ) : b.requires_login || b.is_hot ? (
                        <Badge>Draft</Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-2 break-words text-lg font-semibold text-primary">{b.title}</h3>
                    <p className="text-[13px] text-muted">
                      {b.provider} · {b.views} views
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/bansos-ai/${b.slug}`} className="btn-ghost min-h-10">
                    Lihat
                  </Link>
                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="published" value={b.published} />
                    <button type="submit" className="btn-ghost min-h-10">
                      {b.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteItem}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="btn-danger min-h-10">
                      Hapus
                    </button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
        <AdminPagination
          basePath="/asu/bansos"
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
