import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminListToolbar, AdminPagination } from "@/components/admin-list-controls";
import { CoverImage } from "@/components/cover-image";
import { ImageUrlField } from "@/components/image-url-field";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_PAGE_SIZE, clampAdminPage, parseAdminListQuery } from "@/lib/admin-query";
import { isSafeHttpUrl } from "@/lib/auth";
import {
  bumpProductSold,
  countProducts,
  createProduct,
  deleteProduct,
  formatRp,
  listProducts,
  setProductPublished,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel Marketplace" };

export default async function PanelMarketplacePage({
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
  const total = await countProducts(listOpts);
  const page = clampAdminPage(query.page, total);
  const items = await listProducts({
    ...listOpts,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    limit: ADMIN_PAGE_SIZE,
  });

  async function createProductAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "Token API").trim() || "Token API";
    const price = Number(formData.get("price") || 0);
    const stock = Number(formData.get("stock") || 0);
    const image_url = String(formData.get("image_url") || "").trim();
    const telegram_text = String(formData.get("telegram_text") || "").trim();
    const published = formData.get("published") ? 1 : 0;
    if (!title) redirect("/asu/marketplace");
    if (image_url && !isSafeHttpUrl(image_url)) redirect("/asu/marketplace");
    await createProduct({
      title,
      description,
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      category,
      image_url,
      stock: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
      telegram_text,
      published,
    });
    redirect("/asu/marketplace");
  }

  async function deleteProductAction(formData: FormData) {
    "use server";
    await requireAdmin();
    await deleteProduct(Number(formData.get("id")));
    redirect("/asu/marketplace");
  }

  async function togglePublish(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    const published = Number(formData.get("published")) ? 0 : 1;
    await setProductPublished(id, published);
    redirect("/asu/marketplace");
  }

  async function bumpSold(formData: FormData) {
    "use server";
    await requireAdmin();
    await bumpProductSold(Number(formData.get("id")));
    redirect("/asu/marketplace");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Marketplace" description="Gambar via link. Order → Telegram." />

      <Card hover={false}>
        <h2 className="text-lg font-semibold text-primary">Tambah produk</h2>
        <form action={createProductAction} className="mt-4 grid gap-3">
          <input name="title" placeholder="Judul produk" required className="field" />
          <input name="category" placeholder="Kategori (Token API, Akun AI, ...)" className="field" />
          <ImageUrlField />
          <input name="price" type="number" min={0} step={1000} placeholder="Harga (Rp)" className="field" />
          <input name="stock" type="number" min={0} placeholder="Stok" className="field" />
          <input name="telegram_text" placeholder="Pesan order Telegram (opsional)" className="field" />
          <MarkdownEditor name="description" placeholder="Deskripsi produk (Markdown: **bold**, # heading, - list, ...)" rows={8} />
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" name="published" defaultChecked /> Publish
          </label>
          <button type="submit" className="btn-primary w-fit min-h-11">
            Simpan
          </button>
        </form>
      </Card>

      <section className="space-y-4" aria-labelledby="market-list-heading">
        <h2 id="market-list-heading" className="text-lg font-semibold text-primary">
          Daftar produk
        </h2>
        <AdminListToolbar
          basePath="/asu/marketplace"
          q={query.q}
          sort={query.sort}
          status={query.status}
          total={total}
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
        />
        {items.length === 0 ? (
          <EmptyState text={query.q || query.status !== "all" ? "Tidak ada produk yang cocok." : "Belum ada produk."} />
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  {p.image_url ? (
                    <CoverImage src={p.image_url} alt={p.title} className="h-16 w-24 shrink-0 object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{p.category}</Badge>
                      {p.published ? <Badge>Published</Badge> : <Badge tone="hot">Draft</Badge>}
                    </div>
                    <h3 className="mt-2 break-words text-lg font-semibold text-primary">{p.title}</h3>
                    <p className="text-sm font-medium text-accent">{formatRp(p.price)}</p>
                    <p className="text-[13px] text-muted">
                      Stok {p.stock} · Terjual {p.sold}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/marketplace/${p.slug}`} className="btn-ghost min-h-10">
                    Lihat
                  </Link>
                  <form action={bumpSold}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn-ghost min-h-10">
                      +1 terjual
                    </button>
                  </form>
                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="published" value={p.published} />
                    <button type="submit" className="btn-ghost min-h-10">
                      {p.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
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
          basePath="/asu/marketplace"
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
