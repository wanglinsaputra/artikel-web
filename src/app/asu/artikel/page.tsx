import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminListToolbar, AdminPagination } from "@/components/admin-list-controls";
import { CoverImage } from "@/components/cover-image";
import { ImageUrlField } from "@/components/image-url-field";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_PAGE_SIZE, clampAdminPage, parseAdminListQuery } from "@/lib/admin-query";
import { isSafeHttpUrl } from "@/lib/auth";
import {
  countArticles,
  createArticle,
  deleteArticle,
  listArticles,
  setArticlePublished,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel Artikel" };

export default async function PanelArtikelPage({
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
  const total = await countArticles(listOpts);
  const page = clampAdminPage(query.page, total);
  const items = await listArticles({
    ...listOpts,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    limit: ADMIN_PAGE_SIZE,
  });

  async function createArticleAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const category = String(formData.get("category") || "Umum").trim() || "Umum";
    const author = String(formData.get("author") || "Admin").trim() || "Admin";
    const image_url = String(formData.get("image_url") || "").trim();
    const published = formData.get("published") ? 1 : 0;
    if (!title) redirect("/asu/artikel");
    if (image_url && !isSafeHttpUrl(image_url)) redirect("/asu/artikel");
    await createArticle({
      title,
      excerpt,
      content,
      category,
      author,
      image_url,
      published,
    });
    redirect("/asu/artikel");
  }

  async function deleteArticleAction(formData: FormData) {
    "use server";
    await requireAdmin();
    await deleteArticle(Number(formData.get("id")));
    redirect("/asu/artikel");
  }

  async function togglePublish(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    const published = Number(formData.get("published")) ? 0 : 1;
    await setArticlePublished(id, published);
    redirect("/asu/artikel");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Artikel" description="Tambah / hapus / publish. Gambar via link URL." />

      <Card hover={false}>
        <h2 className="text-lg font-semibold text-primary">Tambah artikel</h2>
        <form action={createArticleAction} className="mt-4 grid gap-3">
          <input name="title" placeholder="Judul" required className="field" />
          <input name="category" placeholder="Kategori (Tools, AI, ...)" className="field" />
          <input name="author" placeholder="Author" defaultValue="Admin" className="field" />
          <ImageUrlField />
          <input name="excerpt" placeholder="Ringkasan" className="field" />
          <textarea name="content" placeholder="Konten" rows={6} className="field" />
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" name="published" defaultChecked /> Publish
          </label>
          <button type="submit" className="btn-primary w-fit min-h-11">
            Simpan
          </button>
        </form>
      </Card>

      <section className="space-y-4" aria-labelledby="artikel-list-heading">
        <h2 id="artikel-list-heading" className="text-lg font-semibold text-primary">
          Daftar artikel
        </h2>
        <AdminListToolbar
          basePath="/asu/artikel"
          q={query.q}
          sort={query.sort}
          status={query.status}
          total={total}
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
        />
        {items.length === 0 ? (
          <EmptyState text={query.q || query.status !== "all" ? "Tidak ada artikel yang cocok." : "Belum ada artikel."} />
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <Card key={a.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  {a.image_url ? (
                    <CoverImage src={a.image_url} alt={a.title} className="h-16 w-24 shrink-0 object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{a.category}</Badge>
                      {a.published ? <Badge>Published</Badge> : <Badge tone="hot">Draft</Badge>}
                    </div>
                    <h3 className="mt-2 break-words text-lg font-semibold text-primary">{a.title}</h3>
                    <p className="truncate text-[13px] text-muted">/{a.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/artikel/${a.slug}`} className="btn-ghost min-h-10">
                    Lihat
                  </Link>
                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="published" value={a.published} />
                    <button type="submit" className="btn-ghost min-h-10">
                      {a.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteArticleAction}>
                    <input type="hidden" name="id" value={a.id} />
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
          basePath="/asu/artikel"
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
