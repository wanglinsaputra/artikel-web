import { CoverImage } from "@/components/cover-image";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge, ButtonLink, Container, TextLink } from "@/components/ui";
import { telegramOrderUrl } from "@/lib/auth";
import { formatRp, getProductBySlug } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug, true);
  if (!product) notFound();

  const orderUrl = product.actionUrl?.trim() || (product.telegram_text?.trim() ? telegramOrderUrl(product.title, product.telegram_text) : "");
  const ctaLabel = product.actionLabel?.trim() || (product.telegram_text?.trim() ? "Order via Telegram" : "Order Here");

  return (
    <Container className="max-w-3xl py-10 md:py-12">
      <TextLink href="/marketplace">← Kembali ke Marketplace</TextLink>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{product.category}</Badge>
        {product.stock > 0 ? (
          <Badge>
            Terjual {product.sold} · Stok {product.stock}
          </Badge>
        ) : product.sold > 0 ? (
          <Badge>Terjual {product.sold}</Badge>
        ) : null}
      </div>
      <h1 className="mt-3 text-[28px] font-bold text-primary sm:text-[32px]">{product.title}</h1>
      {product.price > 0 ? (
        <p className="mt-3 text-2xl font-semibold text-accent">{formatRp(product.price)}</p>
      ) : null}
      <CoverImage src={product.image_url} alt={product.title} className="mt-6 h-64 w-full object-cover" />
      <MarkdownContent content={product.description} className="prose-content mt-6" />
      {orderUrl ? (
        <>
          <ButtonLink href={orderUrl} target="_blank" rel="noreferrer" className="mt-8">
            {ctaLabel}
          </ButtonLink>
          <p className="mt-3 text-[13px] text-muted">
            Pesanan akan diteruskan langsung ke penyedia via link order.
          </p>
        </>
      ) : null}
    </Container>
  );
}
