import Link from "next/link";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { clearUserSession, getCurrentUser } from "@/lib/auth";
import { userDisplayName } from "@/lib/db";
import { Container } from "@/components/ui";
import { NavLink } from "@/components/nav-link";

const links = [
  { href: "/artikel", label: "Artikel" },
  { href: "/bansos-ai", label: "Bansos AI" },
  { href: "/marketplace", label: "Marketplace" },
];

const daftarCls =
  "inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const masukCls =
  "text-sm font-medium text-secondary transition-colors duration-200 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export async function SiteHeader() {
  const user = await getCurrentUser();

  async function logout() {
    "use server";
    await clearUserSession();
    redirect("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[rgba(11,11,16,0.8)] backdrop-blur">
      <Container className="flex h-18 items-center justify-between gap-4 md:h-20">
        {/* Left: logo + nav */}
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="WangLinS"
          >
            <BrandLogo className="h-9 w-9" priority />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Utama">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: account (desktop) */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <span className="max-w-40 truncate text-[13px] text-muted">{userDisplayName(user)}</span>
              <form action={logout}>
                <button type="submit" className={masukCls}>
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/masuk" className={masukCls}>
                Masuk
              </Link>
              <Link href="/daftar" className={daftarCls}>
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Daftar + menu */}
        <div className="flex items-center gap-3 md:hidden">
          {!user ? (
            <Link href="/daftar" className={daftarCls}>
              Daftar
            </Link>
          ) : null}
          <details className="relative">
            <summary
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-border text-secondary transition-colors duration-200 ease-out hover:border-border-hover hover:bg-surface-hover hover:text-primary [&::-webkit-details-marker]:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-border bg-surface p-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors duration-200 ease-out hover:bg-surface-hover hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-1 border-t border-border" />
              {user ? (
                <>
                  <div className="px-3 py-2 text-[13px] text-muted">{userDisplayName(user)}</div>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-secondary transition-colors duration-200 ease-out hover:bg-surface-hover hover:text-primary"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/masuk"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-secondary transition-colors duration-200 ease-out hover:bg-surface-hover hover:text-primary"
                >
                  Masuk
                </Link>
              )}
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
