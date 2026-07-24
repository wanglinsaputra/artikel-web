import type { Metadata } from "next";
import { Sparkles, BookOpen, Gift, ShoppingBag, ShieldCheck, Mail } from "lucide-react";
import { Container, Card, PageHeader, BackHomeLink, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Tentang WangLinS — Portal AI terintegrasi untuk artikel teknologi, informasi bansos AI, dan marketplace token AI.",
};

const CONTACT_EMAIL = "devops@wanglins.web.id";

export default function AboutPage() {
  return (
    <div className="py-10 md:py-16">
      <Container className="max-w-4xl">
        <BackHomeLink />

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-4 w-4" />
            <span>Portal AI & Ekosistem Terintegrasi</span>
          </div>
          <PageHeader
            title="Tentang WangLinS"
            description="WangLinS adalah platform generasi mendatang yang menghubungkan informasi kecerdasan buatan, akses bansos berbasis AI, dan marketplace token secara cepat, intuitif, dan aman."
          />
        </div>

        <div className="space-y-8">
          <Card hover={false} className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Visi & Misi Kami</h2>
            <p className="text-sm leading-relaxed text-secondary">
              Kami percaya bahwa teknologi kecerdasan buatan (AI) harus dapat diakses oleh semua orang secara transparan dan mudah dipahami. WangLinS hadir sebagai pusat pengetahuan dan layanan yang mempermudah masyarakat menemukan artikel berbobot, informasi bantuan sosial berbasis teknologi, serta kebutuhan produk digital token.
            </p>
          </Card>

          <div>
            <h2 className="mb-4 text-lg font-bold text-primary">Layanan Utama</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card hover={true} className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-elevated text-accent">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-primary">Artikel AI</h3>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">
                    Panduan mendalam, analisis tren, dan wawasan terbaru seputar perkembangan teknologi kecerdasan buatan.
                  </p>
                </div>
                <ButtonLink href="/artikel" variant="secondary" className="w-full text-xs">
                  Jelajahi Artikel
                </ButtonLink>
              </Card>

              <Card hover={true} className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-elevated text-accent">
                    <Gift className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-primary">Bansos AI</h3>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">
                    Informasi program bantuan, kredit promo, dan alat AI gratis yang dikurasi khusus untuk komunitas.
                  </p>
                </div>
                <ButtonLink href="/bansos-ai" variant="secondary" className="w-full text-xs">
                  Cek Bansos AI
                </ButtonLink>
              </Card>

              <Card hover={true} className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-elevated text-accent">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-primary">Marketplace</h3>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">
                    Penyediaan voucher, token API, dan lisensi produk AI dengan akses langsung dan praktis.
                  </p>
                </div>
                <ButtonLink href="/marketplace" variant="secondary" className="w-full text-xs">
                  Buka Marketplace
                </ButtonLink>
              </Card>
            </div>
          </div>

          <Card hover={false} className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span>Membutuhkan Informasi Lebih Lanjut?</span>
              </div>
              <p className="mt-1 text-xs text-secondary">
                Tim operasional & teknis kami siap memberikan dukungan terkait pertanyaan platform.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </Card>
        </div>
      </Container>
    </div>
  );
}
