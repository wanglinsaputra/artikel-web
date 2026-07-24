import { CoverImage } from "@/components/cover-image";
import { TrackSectionView } from "@/components/track-section-view";
import { BackHomeLink, Badge, Card, Container, EmptyState, FilterPill, TextLink } from "@/components/ui";
import { formatRp, listProducts, productCategories } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketplace" };

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [products, cats] = await Promise.all([
    listProducts({ publishedOnly: true, category: cat }),
    productCategories(),
  ]);

  return (
    <Container className="py-10 md:py-12">
      <TrackSectionView section="marketplace" />
      <BackHomeLink />
      <h1 className="text-[28px] font-bold text-primary sm:text-[32px]">Marketplace</h1>
      <p className="mt-2 text-base text-secondary">Jasa pembuatan website, bot, automation, token API & produk.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill href="/marketplace" active={!cat}>
          Semua
        </FilterPill>
        {cats.map((c) => (
          <FilterPill key={c} href={`/marketplace?cat=${encodeURIComponent(c)}`} active={cat === c}>
            {c}
          </FilterPill>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {products.length === 0 ? <EmptyState text="Belum ada produk." /> : null}
        {products.map((p) => (
          <Card key={p.id}>
            <CoverImage src={p.image_url} alt={p.title} className="mb-3 h-40 w-full object-cover" />
            <div className="flex flex-wrap gap-2">
              <Badge>{p.category}</Badge>
              {p.stock > 0 ? (
                <Badge>
                  Terjual {p.sold} · Stok {p.stock}
                </Badge>
              ) : p.sold > 0 ? (
                <Badge>Terjual {p.sold}</Badge>
              ) : null}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-primary">{p.title}</h2>
            <p className="mt-2 line-clamp-3 text-base text-secondary">{p.description}</p>
            {p.price > 0 ? <p className="mt-3 font-medium text-accent">{formatRp(p.price)}</p> : null}
            <TextLink href={`/marketplace/${p.slug}`} className="mt-4 inline-block">
              Lihat Detail →
            </TextLink>
          </Card>
        ))}
      </div>
    </Container>
  );
}
