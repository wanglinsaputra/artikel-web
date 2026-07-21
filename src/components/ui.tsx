import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  const hasMax = /\bmax-w-/.test(className);
  return (
    <div className={`mx-auto w-full px-4 md:px-6 ${hasMax ? "" : "max-w-[1240px]"} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "hot" | "lock";
}) {
  const cls =
    tone === "hot"
      ? "bg-badge-warning text-badge-warning-fg"
      : tone === "lock"
        ? "bg-badge-info text-badge-info-fg"
        : "bg-badge-neutral text-badge-neutral-fg";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-medium ${cls}`}>{children}</span>
  );
}

/** Max 1 colored status badge: Login dulu > Hot */
export function StatusBadge({
  requiresLogin,
  isHot,
}: {
  requiresLogin?: boolean | number;
  isHot?: boolean | number;
}) {
  if (requiresLogin) return <Badge tone="lock">Login dulu</Badge>;
  if (isHot) return <Badge tone="hot">Hot</Badge>;
  return null;
}

export function Card({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const hoverCls = hover
    ? "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border-hover hover:bg-surface-hover"
    : "";
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 ${hoverCls} ${className}`.trim()}>{children}</div>
  );
}

const btnBase =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const btnVariants = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border border-border bg-transparent text-primary hover:border-accent",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" }) {
  return (
    <button type="button" className={`${btnBase} ${btnVariants[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" }) {
  return (
    <Link href={href} className={`${btnBase} ${btnVariants[variant]} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}

export function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active
          ? "bg-accent font-medium text-white"
          : "border border-border bg-surface text-secondary hover:border-accent hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({
  kicker,
  title,
  href,
  linkLabel,
}: {
  kicker: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-accent">{kicker}</p>
        <h2 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-primary sm:text-[32px]">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm text-accent transition-colors hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {linkLabel || "Lihat semua"}
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-base text-secondary">
      {text}
    </p>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`text-sm text-accent transition-colors hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`.trim()}
    >
      {children}
    </Link>
  );
}

export function Alert({
  children,
  tone = "error",
  className = "",
}: {
  children: ReactNode;
  tone?: "error" | "success";
  className?: string;
}) {
  return (
    <p className={`alert ${tone === "success" ? "alert-success" : "alert-error"} ${className}`.trim()}>{children}</p>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-primary sm:text-[32px]">{title}</h1>
      {description ? <p className="mt-2 text-base text-secondary">{description}</p> : null}
    </div>
  );
}

/** Always links to `/` — list entry pages, not history back */
export function BackHomeLink() {
  return (
    <Link
      href="/"
      className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-transparent px-4 py-2 text-sm text-primary transition-all duration-200 ease-out hover:border-border-hover hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ArrowLeft className="h-[18px] w-[18px] shrink-0" aria-hidden />
      Kembali ke Beranda
    </Link>
  );
}
