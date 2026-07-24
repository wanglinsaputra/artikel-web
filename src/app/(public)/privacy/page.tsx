import type { Metadata } from "next";
import { ShieldCheck, Lock, Cookie, Mail, Eye } from "lucide-react";
import { Container, Card, PageHeader, BackHomeLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan Privasi portal WangLinS — Informasi mengenai pengumpulan, penggunaan, dan perlindungan data pengguna serta Google AdSense.",
};

const CONTACT_EMAIL = "devops@wanglins.web.id";

export default function PrivacyPage() {
  return (
    <div className="py-10 md:py-16">
      <Container className="max-w-4xl">
        <BackHomeLink />

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-accent">
            <ShieldCheck className="h-4 w-4" />
            <span>Privasi & Keamanan Data</span>
          </div>
          <PageHeader
            title="Kebijakan Privasi"
            description="Komitmen kami dalam menjaga privasi, keamanan data pengguna, dan transparansi penggunaan layanan di WangLinS."
          />
          <p className="mt-3 text-xs text-muted">Terakhir diperbarui: 24 Juli 2026</p>
        </div>

        <div className="space-y-6">
          <Card hover={false} className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Eye className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">1. Pengumpulan Informasi</h2>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar akun di WangLinS (seperti alamat email dan nama pengguna), serta informasi otomatis berupa log akses perangkat, alamat IP, dan interaksi halaman untuk meningkatkan performa sistem.
            </p>
          </Card>

          <Card hover={false} className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">2. Penggunaan Informasi</h2>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              Informasi yang dikumpulkan digunakan untuk:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-secondary">
              <li>Menyediakan dan mengelola akses ke fitur Artikel AI, Bansos AI, serta Marketplace Token.</li>
              <li>Memverifikasi identitas pengguna dan mencegah aktivitas penipuan atau penyalahgunaan akun.</li>
              <li>Mengirimkan pemberitahuan penting terkait pembaruan sistem dan keamanan akun.</li>
            </ul>
          </Card>

          <Card hover={false} className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Cookie className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">3. Cookie & Google AdSense</h2>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              WangLinS menggunakan cookie dan teknologi serupa untuk menyimpan preferensi sesi serta menganalisis lalu lintas web. 
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              Layanan kami mengintegrasikan <strong>Google AdSense</strong> untuk menampilkan iklan. Google sebagai vendor pihak ketiga menggunakan cookie (termasuk Cookie DART) untuk menyajikan iklan berdasarkan kunjungan Anda ke situs ini dan/atau situs lain di internet. Anda dapat membatalkan penggunaan Cookie DART dengan mengunjungi <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-accent-hover">Kebijakan Privasi Iklan dan Jaringan Konten Google</a>.
            </p>
          </Card>

          <Card hover={false} className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">4. Hubungi Pengelola</h2>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              Apabila Anda memiliki pertanyaan, saran, atau permintaan terkait pengelolaan data pribadi Anda pada platform WangLinS, silakan hubungi tim devops kami melalui email resmi:
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-2 text-sm font-mono text-primary">
              <span>{CONTACT_EMAIL}</span>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
