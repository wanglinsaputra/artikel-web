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

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
      aria-label="Pagination"
    >
      <p className="text-[13px] text-muted">
        Halaman {page} / {totalPages}
      </p>
      <div className="flex flex-wrap gap-2">
        {prev ? (
          <Link href={link(prev)} className="btn-ghost min-h-10 px-4" prefetch={false}>
            ← Prev
          </Link>
        ) : (
          <span className="btn-ghost min-h-10 cursor-not-allowed px-4 opacity-40">← Prev</span>
        )}
        {next ? (
          <Link href={link(next)} className="btn-ghost min-h-10 px-4" prefetch={false}>
            Next →
          </Link>
        ) : (
          <span className="btn-ghost min-h-10 cursor-not-allowed px-4 opacity-40">Next →</span>
        )}
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
