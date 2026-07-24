import { CoverImage } from "@/components/cover-image";
import { TrackSectionView } from "@/components/track-section-view";
import { BackHomeLink, Badge, Card, Container, EmptyState, FilterPill, StatusBadge, TextLink } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { bansosCategories, listBansos } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bansos AI" };

export default async function BansosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const user = await getCurrentUser();
  const [items, cats] = await Promise.all([
    listBansos({ publishedOnly: true, category: cat }),
    bansosCategories(),
  ]);

  return (
    <Container className="py-10 md:py-12">
      <TrackSectionView section="bansos-ai" />
      <BackHomeLink />
      <h1 className="text-[28px] font-bold text-primary sm:text-[32px]">Bansos AI</h1>
      <p className="mt-2 text-base text-secondary">Free credit, trial, dan tools AI. Item hot butuh login.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill href="/bansos-ai" active={!cat}>
          Semua
        </FilterPill>
        {cats.map((c) => (
          <FilterPill key={c} href={`/bansos-ai?cat=${encodeURIComponent(c)}`} active={cat === c}>
            {c}
          </FilterPill>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {items.length === 0 ? <EmptyState text="Belum ada bansos." /> : null}
        {items.map((b) => {
          const locked = b.requires_login === 1 && !user;
          return (
            <Card key={b.id}>
              <CoverImage src={b.image_url} alt={b.title} className="mb-3 h-40 w-full object-cover" />
              <div className="flex flex-wrap gap-2">
                <Badge>{b.category}</Badge>
                <StatusBadge requiresLogin={b.requires_login} isHot={b.is_hot} />
              </div>
              <h2 className="mt-3 text-lg font-semibold text-primary">{b.title}</h2>
              <p className="mt-1 text-[13px] text-muted">{b.provider}</p>
              <p className="mt-2 line-clamp-3 text-base text-secondary">{b.excerpt}</p>
              <p className="mt-3 text-[13px] text-muted">
                {b.views} views · Berlaku: {b.valid_until || "Belum disebutkan"}
              </p>
              <TextLink
                href={locked ? `/daftar?next=/bansos-ai/${b.slug}` : `/bansos-ai/${b.slug}`}
                className="mt-4 inline-block"
              >
                {locked ? "Daftar untuk membuka →" : "Buka detail →"}
              </TextLink>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
