import { CoverImage } from "@/components/cover-image";
import { TrackSectionView } from "@/components/track-section-view";
import { BackHomeLink, Badge, Card, Container, EmptyState, FilterPill, TextLink } from "@/components/ui";
import { articleCategories, listArticles } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Artikel" };

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [articles, cats] = await Promise.all([
    listArticles({ publishedOnly: true, category: cat }),
    articleCategories(),
  ]);

  return (
    <Container className="py-10 md:py-12">
      <TrackSectionView section="artikel" />
      <BackHomeLink />
      <h1 className="text-[28px] font-bold text-primary sm:text-[32px]">Artikel</h1>
      <p className="mt-2 text-base text-secondary">Panduan praktis seputar AI dan tools digital.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill href="/artikel" active={!cat}>
          Semua
        </FilterPill>
        {cats.map((c) => (
          <FilterPill key={c} href={`/artikel?cat=${encodeURIComponent(c)}`} active={cat === c}>
            {c}
          </FilterPill>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
        {articles.length === 0 ? <EmptyState text="Belum ada artikel." /> : null}
        {articles.map((a) => (
          <Card key={a.id}>
            <CoverImage src={a.image_url} alt={a.title} className="mb-3 h-44 w-full object-cover" />
            <Badge>{a.category}</Badge>
            <h2 className="mt-3 text-lg font-semibold text-primary sm:text-xl">{a.title}</h2>
            <p className="mt-2 text-base text-secondary">{a.excerpt}</p>
            <p className="mt-3 text-[13px] text-muted">
              {a.author} · {a.created_at.slice(0, 10)}
            </p>
            <TextLink href={`/artikel/${a.slug}`} className="mt-4 inline-block">
              Baca Selengkapnya →
            </TextLink>
          </Card>
        ))}
      </div>
    </Container>
  );
}
