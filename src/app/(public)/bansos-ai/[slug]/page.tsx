import { CoverImage } from "@/components/cover-image";
import { Badge, Container, StatusBadge, TextLink } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { bumpBansosViews, getBansosBySlug } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BansosDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const item = await getBansosBySlug(slug, true);
  if (!item) notFound();

  if (item.requires_login === 1 && !user) {
    redirect(`/daftar?next=/bansos-ai/${slug}`);
  }

  await bumpBansosViews(item.id);

  const steps = item.how_to_claim?.filter(Boolean) ?? [];
  const notes = item.security_notes?.filter(Boolean) ?? [];
  const ctaLabel = item.actionLabel?.trim() || "Buka Situs Resmi";

  return (
    <Container className="max-w-3xl py-10 md:py-12">
      <TextLink href="/bansos-ai">← Kembali ke Bansos AI</TextLink>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{item.category}</Badge>
        <StatusBadge isHot={item.is_hot} />
      </div>
      <h1 className="mt-3 text-[28px] font-bold text-primary sm:text-[32px]">{item.title}</h1>
      <p className="mt-2 text-[13px] text-muted">
        {item.provider} · {item.views + 1} views · Berlaku: {item.valid_until || "Belum disebutkan"}
      </p>
      <CoverImage src={item.image_url} alt={item.title} className="mt-6 h-64 w-full object-cover" />
      {item.excerpt ? <p className="mt-4 text-base text-secondary">{item.excerpt}</p> : null}
      {item.content ? <div className="prose-content mt-8">{item.content}</div> : null}

      {steps.length > 0 ? (
        <section className="mt-10" aria-labelledby="cara-klaim-heading">
          <h2 id="cara-klaim-heading" className="text-xl font-semibold text-primary">
            Cara klaim
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-base text-secondary">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section className="mt-10" aria-labelledby="syarat-heading">
          <h2 id="syarat-heading" className="text-xl font-semibold text-primary">
            Syarat dan catatan keamanan
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-secondary">
            {notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.actionUrl ? (
        <div className="mt-8">
          <a
            href={item.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            {ctaLabel}
          </a>
        </div>
      ) : null}
    </Container>
  );
}
