import { CoverImage } from "@/components/cover-image";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionTitle,
  StatusBadge,
  TextLink,
} from "@/components/ui";
import { formatRp, getTrendingSections, listArticles, listBansos, listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, bansos, products, trending] = await Promise.all([
    listArticles({ publishedOnly: true, limit: 3 }),
    listBansos({ publishedOnly: true, limit: 3 }),
    listProducts({ publishedOnly: true, limit: 3 }),
    getTrendingSections(),
  ]);

  const top = trending[0];
  const hasAnalytics = trending.some((t) => t.views > 0);
  const top3 = trending.slice(0, 3);

  return (
    <Container className="space-y-16 py-10 md:space-y-24 md:py-12">
      <section className="rounded-2xl border border-border bg-surface p-8 sm:p-12">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-accent">WangLinS · Portal & Development</p>
          {hasAnalytics && top ? (
            <Badge tone="hot">Trending · {top.title}</Badge>
          ) : null}
        </div>
        <h1 className="mt-3 max-w-2xl text-[44px] font-bold leading-tight tracking-tight text-primary sm:text-[56px]">
          {hasAnalytics && top
            ? `${top.title} lagi naik. Mulai dari sini.`
            : "Solusi AI, Tools & Jasa Development Terpercaya"}
        </h1>
        <p className="mt-4 max-w-xl text-base text-secondary">
          {hasAnalytics && top
            ? top.desc
            : "Panduan AI terbaru, promo kredit gratis, serta marketplace produk & jasa pembuatan website / bot — semua dalam satu tempat."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {hasAnalytics && top ? (
            <>
              <ButtonLink href={top.href}>Buka {top.title}</ButtonLink>
              <ButtonLink href="/artikel" variant="secondary">
                Jelajahi Artikel
              </ButtonLink>
              <ButtonLink href="/bansos-ai" variant="secondary">
                Lihat Bansos AI
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/artikel">Jelajahi Artikel</ButtonLink>
              <ButtonLink href="/bansos-ai" variant="secondary">
                Lihat Bansos AI
              </ButtonLink>
              <ButtonLink href="/marketplace" variant="secondary">
                Marketplace
              </ButtonLink>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="trending-heading">
        <SectionTitle kicker="Trending" title="Top 3 kategori" />
        <h2 id="trending-heading" className="sr-only">
          Top 3 Trending Categories
        </h2>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {top3.map((item) => (
            <Card key={item.section}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>#{item.rank}</Badge>
                {item.rank === 1 && hasAnalytics ? <Badge tone="hot">Trending</Badge> : null}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-primary sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-base text-secondary">{item.desc}</p>
              {hasAnalytics ? (
                <p className="mt-2 text-[13px] text-muted">{item.views.toLocaleString("id-ID")} views</p>
              ) : null}
              <TextLink href={item.href} className="mt-4 inline-block">
                Buka {item.title} →
              </TextLink>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle kicker="Artikel terbaru" title="Insight" href="/artikel" linkLabel="Semua Artikel" />
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {articles.map((a) => (
            <Card key={a.id}>
              <CoverImage src={a.image_url} alt={a.title} className="mb-3 h-40 w-full object-cover" />
              <Badge>{a.category}</Badge>
              <h3 className="mt-3 text-lg font-semibold text-primary sm:text-xl">{a.title}</h3>
              <p className="mt-2 line-clamp-2 text-base text-secondary">{a.excerpt}</p>
              <p className="mt-3 text-[13px] text-muted">{a.created_at.slice(0, 10)}</p>
              <TextLink href={`/artikel/${a.slug}`} className="mt-3 inline-block">
                Baca Artikel →
              </TextLink>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle kicker="Bansos AI" title="Bansos pilihan" href="/bansos-ai" linkLabel="Lihat Semua" />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {bansos.map((b) => (
            <Card key={b.id}>
              <CoverImage src={b.image_url} alt={b.title} className="mb-3 h-36 w-full object-cover" />
              <div className="flex flex-wrap gap-2">
                <Badge>{b.category}</Badge>
                <StatusBadge requiresLogin={b.requires_login} isHot={b.is_hot} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-primary">{b.title}</h3>
              <p className="mt-1 text-[13px] text-muted">{b.provider}</p>
              <p className="mt-2 line-clamp-2 text-base text-secondary">{b.excerpt}</p>
              <TextLink
                href={b.requires_login ? `/daftar?next=/bansos-ai/${b.slug}` : `/bansos-ai/${b.slug}`}
                className="mt-3 inline-block"
              >
                {b.requires_login ? "Daftar untuk membuka →" : "Buka detail →"}
              </TextLink>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle kicker="Marketplace" title="Jasa & Produk Digital" href="/marketplace" linkLabel="Lihat Semua" />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {products.map((p) => (
            <Card key={p.id}>
              <CoverImage src={p.image_url} alt={p.title} className="mb-3 h-36 w-full object-cover" />
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
              <h3 className="mt-3 text-lg font-semibold text-primary">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-base text-secondary">{p.description}</p>
              {p.price > 0 ? <p className="mt-3 font-medium text-accent">{formatRp(p.price)}</p> : null}
              <TextLink href={`/marketplace/${p.slug}`} className="mt-3 inline-block">
                Lihat Detail →
              </TextLink>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
}
