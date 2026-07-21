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
      <p className="mt-4 text-base text-secondary">{item.excerpt}</p>
      <div className="prose-content mt-8">{item.content}</div>
      {item.actionUrl ? (
        <div className="mt-8">
          <a
            href={item.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            {item.actionLabel?.trim() || "Open Website"}
          </a>
        </div>
      ) : null}
    </Container>
  );
}
