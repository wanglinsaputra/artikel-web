import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/ui";

const YEAR = 2026;

const footerNav = [
  { href: "/about", label: "Tentang Kami" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/contact", label: "Kontak" },
  { href: "/artikel", label: "Artikel" },
  { href: "/bansos-ai", label: "Bansos AI" },
  { href: "/marketplace", label: "Marketplace" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-base py-10">
      <Container className="flex flex-col items-center justify-between gap-6 text-center text-[13px] leading-relaxed text-muted md:flex-row md:text-left">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Link href="/" aria-label="WangLinS" className="inline-flex items-center gap-2.5">
            <BrandLogo className="h-7 w-7" />
            <span className="font-semibold text-primary">WangLinS</span>
          </Link>
          <p>© {YEAR} WangLinS. Portal AI & Ekosistem Terintegrasi.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-secondary">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}

