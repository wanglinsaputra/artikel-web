import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/ui";

// Fixed year avoids any SSR/client clock edge cases around year boundary.
const YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <Container className="flex flex-col items-center gap-3 py-8 text-center text-[13px] leading-relaxed text-muted">
        <Link href="/" aria-label="WangLinS" className="inline-flex">
          <BrandLogo className="h-8 w-8" />
        </Link>
        <p>© {YEAR} WangLinS</p>
      </Container>
    </footer>
  );
}
