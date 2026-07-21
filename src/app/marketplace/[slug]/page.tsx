import { CoverImage } from "@/components/cover-image";
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

  const orderUrl = telegramOrderUrl(product.title, product.telegram_text);

  return (
    <Container className="max-w-3xl py-10 md:py-12">
      <TextLink href="/marketplace">← Kembali ke Marketplace</TextLink>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{product.category}</Badge>
        <Badge>
          Terjual {product.sold} · Stok {product.stock}
        </Badge>
      </div>
      <h1 className="mt-3 text-[28px] font-bold text-primary sm:text-[32px]">{product.title}</h1>
      <p className="mt-3 text-2xl font-semibold text-accent">{formatRp(product.price)}</p>
      <CoverImage src={product.image_url} alt={product.title} className="mt-6 h-64 w-full object-cover" />
      <p className="prose-content mt-6">{product.description}</p>
      <ButtonLink href={orderUrl} target="_blank" rel="noreferrer" className="mt-8">
        Order via Telegram
      </ButtonLink>
      <p className="mt-3 text-[13px] text-muted">
        Payments are currently handled manually. Orders are automatically forwarded to the admin via Telegram.
      </p>
    </Container>
  );
}
