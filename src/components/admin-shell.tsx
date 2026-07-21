"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const nav = [
  { href: "/asu", label: "Overview", exact: true },
  { href: "/asu/artikel", label: "Artikel" },
  { href: "/asu/bansos", label: "Bansos AI" },
  { href: "/asu/marketplace", label: "Marketplace" },
  { href: "/asu/users", label: "Users" },
];

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  logoutAction,
}: {
  children: React.ReactNode;
  logoutAction: () => void | Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="mt-4 space-y-1" aria-label="Panel">
      {nav.map((item) => {
        const active = navActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`block rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active
                ? "bg-elevated font-medium text-primary"
                : "text-secondary hover:bg-surface-hover hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const SideFooter = () => (
    <>
      <form action={logoutAction} className="mt-6">
        <button type="submit" className="btn-ghost w-full min-h-11">
          Logout
        </button>
      </form>
      <Link
        href="/"
        className="mt-3 block text-center text-[13px] text-accent transition-colors hover:text-accent-hover"
      >
        ← Lihat situs
      </Link>
    </>
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden px-4 py-4 md:py-8">
      {/* Mobile top bar */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 md:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Panel</p>
          <p className="truncate text-sm font-medium text-primary">
            {nav.find((n) => navActive(pathname, n.href, n.exact))?.label || "Admin"}
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost min-h-11 min-w-11 px-3"
          aria-expanded={open}
          aria-controls="admin-drawer"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id="admin-drawer"
            className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col border-r border-border bg-surface p-4 shadow-(--shadow-card)"
          >
            <div className="flex items-center justify-between gap-2">
              <p id={titleId} className="text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
                Panel
              </p>
              <button type="button" className="btn-ghost min-h-10 px-3" onClick={() => setOpen(false)}>
                Tutup
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <SideFooter />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-2xl border border-border bg-surface p-4 md:sticky md:top-4 md:block md:self-start">
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-accent">Panel</p>
          <NavItems />
          <SideFooter />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
