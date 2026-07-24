import Link from "next/link";
import { adminListHref, type AdminSort, type AdminStatus } from "@/lib/admin-query";

export function AdminListToolbar({
  basePath,
  q,
  sort,
  status,
  total,
  page,
  pageSize,
  showStatus = true,
  searchPlaceholder = "Cari judul, slug, kategori…",
}: {
  basePath: string;
  q: string;
  sort: AdminSort;
  status: AdminStatus;
  total: number;
  page: number;
  pageSize: number;
  showStatus?: boolean;
  searchPlaceholder?: string;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-3">
      <form method="get" action={basePath} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="min-w-0">
          <label htmlFor="admin-q" className="sr-only">
            Cari
          </label>
          <input
            id="admin-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={searchPlaceholder}
            className="field min-h-11"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="admin-sort" className="sr-only">
            Urutkan
          </label>
          <select id="admin-sort" name="sort" defaultValue={sort} className="field min-h-11">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="title">Judul A–Z</option>
          </select>
        </div>
        {showStatus ? (
          <div>
            <label htmlFor="admin-status" className="sr-only">
              Status
            </label>
            <select id="admin-status" name="status" defaultValue={status} className="field min-h-11">
              <option value="all">Semua</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        ) : null}
        <button type="submit" className="btn-primary min-h-11 w-full sm:w-auto">
          Terapkan
        </button>
      </form>
      <p className="text-[13px] text-muted" aria-live="polite">
        {total === 0 ? "0 hasil" : `Menampilkan ${from}–${to} dari ${total}`}
      </p>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function AdminPagination({
  basePath,
  page,
  pageSize,
  total,
  q,
  sort,
  status,
  extra,
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  q: string;
  sort: string;
  status?: AdminStatus | string;
  extra?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const link = (p: number) =>
    adminListHref(basePath, {
      page: p,
      q: q || undefined,
      sort,
      status,
      extra,
    });

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav
      className="border-t border-border pt-4"
      aria-label="Pagination"
    >
      {/* Mobile view (< 640px) — Compact prev/next to fit ~375px screens */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <p className="text-xs text-muted">
          Halaman {page} dari {totalPages}
        </p>
        <div className="flex items-center gap-1.5">
          {prev ? (
            <Link href={link(prev)} className="btn-ghost min-h-9 px-3 text-xs" prefetch={false}>
              ← Prev
            </Link>
          ) : (
            <span className="btn-ghost min-h-9 cursor-not-allowed px-3 text-xs opacity-40">← Prev</span>
          )}
          {next ? (
            <Link href={link(next)} className="btn-ghost min-h-9 px-3 text-xs" prefetch={false}>
              Next →
            </Link>
          ) : (
            <span className="btn-ghost min-h-9 cursor-not-allowed px-3 text-xs opacity-40">Next →</span>
          )}
        </div>
      </div>

      {/* Desktop view (>= 640px) — Full page numbers with active accent highlight */}
      <div className="hidden items-center justify-between gap-3 sm:flex">
        <p className="text-[13px] text-muted">
          Halaman {page} dari {totalPages}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {prev ? (
            <Link href={link(prev)} className="btn-ghost min-h-10 px-3 text-xs" prefetch={false}>
              ← Prev
            </Link>
          ) : (
            <span className="btn-ghost min-h-10 cursor-not-allowed px-3 text-xs opacity-40">← Prev</span>
          )}

          {pageNumbers.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-xs text-muted">
                  ...
                </span>
              );
            }
            const isActive = p === page;
            return isActive ? (
              <span
                key={p}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white"
                aria-current="page"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={link(p)}
                className="btn-ghost min-h-10 min-w-10 px-2.5 text-xs text-secondary hover:text-primary"
                prefetch={false}
              >
                {p}
              </Link>
            );
          })}

          {next ? (
            <Link href={link(next)} className="btn-ghost min-h-10 px-3 text-xs" prefetch={false}>
              Next →
            </Link>
          ) : (
            <span className="btn-ghost min-h-10 cursor-not-allowed px-3 text-xs opacity-40">Next →</span>
          )}
        </div>
      </div>
    </nav>
  );
}

export function AdminListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}
