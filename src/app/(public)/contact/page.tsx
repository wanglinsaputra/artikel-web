import type { Metadata } from "next";
import { Mail, Send, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { Container, Card, PageHeader, BackHomeLink } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = {
  title: "Kontak Kami",
  description:
    "Hubungi tim WangLinS melalui email devops@wanglins.web.id atau dukungan layanan resmi.",
};

const CONTACT_EMAIL = "devops@wanglins.web.id";

export default function ContactPage() {
  const telegramUsername = process.env.TELEGRAM_USERNAME || "wanglinsaputra";

  return (
    <div className="py-10 md:py-16">
      <Container className="max-w-4xl">
        <BackHomeLink />

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-accent">
            <MessageSquare className="h-4 w-4" />
            <span>Dukungan & Layanan Pengguna</span>
          </div>
          <PageHeader
            title="Hubungi Kami"
            description="Ada pertanyaan, kendala teknis, atau penawaran kerja sama? Tim WangLinS siap membantu Anda."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Email Card */}
          <Card hover={false} className="flex flex-col justify-between space-y-6">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg-elevated text-accent">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-primary">Email Resmi</h2>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Kirimkan pesan untuk pertanyaan teknis, kendala akun, permintaan privasi, atau kerja sama bisnis.
              </p>
              
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-bg-elevated p-3">
                <span className="font-mono text-sm text-primary truncate pr-2">{CONTACT_EMAIL}</span>
                <CopyButton text={CONTACT_EMAIL} label="Salin Email" />
              </div>
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Mail className="h-4 w-4" />
              <span>Kirim Email Langsung</span>
            </a>
          </Card>

          {/* Telegram Support Card */}
          <Card hover={false} className="flex flex-col justify-between space-y-6">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg-elevated text-accent">
                <Send className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-primary">Telegram Support</h2>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Respon cepat untuk bantuan pemesanan marketplace, konfirmasi token, atau pertanyaan seputar Bansos AI.
              </p>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-bg-elevated p-3">
                <span className="font-mono text-sm text-primary">@{telegramUsername}</span>
                <CopyButton text={`https://t.me/${telegramUsername}`} label="Salin Link" />
              </div>
            </div>

            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Send className="h-4 w-4" />
              <span>Buka Telegram</span>
            </a>
          </Card>
        </div>

        {/* Additional Info Card */}
        <Card hover={false} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">Jam Operasional Tim</p>
              <p className="text-xs text-secondary">Senin - Minggu (08:00 - 22:00 WIB). Email akan dibalas maksimal 1x24 jam.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Layanan Resmi WangLinS</span>
          </div>
        </Card>
      </Container>
    </div>
  );
}
