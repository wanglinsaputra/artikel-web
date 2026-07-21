import { CoverImage } from "@/components/cover-image";
import { Badge, Container, TextLink } from "@/components/ui";
import { getArticleBySlug } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, true);
  if (!article) notFound();

  return (
    <Container className="max-w-3xl py-10 md:py-12">
      <TextLink href="/artikel">← Kembali ke Artikel</TextLink>
      <div className="mt-4">
        <Badge>{article.category}</Badge>
      </div>
      <h1 className="mt-3 text-[28px] font-bold text-primary sm:text-[32px]">{article.title}</h1>
      <p className="mt-2 text-[13px] text-muted">
        {article.author} · {article.created_at.slice(0, 10)}
      </p>
      <CoverImage src={article.image_url} alt={article.title} className="mt-6 h-64 w-full object-cover" />
      <p className="mt-4 text-base text-secondary">{article.excerpt}</p>
      <div className="prose-content mt-8">{article.content}</div>
    </Container>
  );
}
