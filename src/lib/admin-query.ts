/** Shared admin list query parsing (URL searchParams). */

export const ADMIN_PAGE_SIZE = 10;

export type AdminSort = "newest" | "oldest" | "title";
export type AdminStatus = "all" | "published" | "draft";

export type AdminListQuery = {
  page: number;
  q: string;
  sort: AdminSort;
  status: AdminStatus;
  skip: number;
  limit: number;
};

function parsePage(raw: string | undefined) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function parseAdminListQuery(
  sp: { page?: string; q?: string; sort?: string; status?: string },
  pageSize = ADMIN_PAGE_SIZE
): AdminListQuery {
  const page = parsePage(sp.page);
  const q = String(sp.q || "").trim();
  const sort: AdminSort =
    sp.sort === "oldest" || sp.sort === "title" ? sp.sort : "newest";
  const status: AdminStatus =
    sp.status === "published" || sp.status === "draft" ? sp.status : "all";
  return {
    page,
    q,
    sort,
    status,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };
}

export function adminListHref(
  basePath: string,
  opts: {
    page?: number;
    q?: string;
    sort?: string;
    status?: string;
    extra?: Record<string, string | undefined>;
  }
) {
  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  // keep sort in URL so pagination preserves non-default orders (users: id; content: newest)
  if (opts.sort) params.set("sort", opts.sort);
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  if (opts.extra) {
    for (const [k, v] of Object.entries(opts.extra)) {
      if (v && v !== "all") params.set(k, v);
    }
  }
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function clampAdminPage(page: number, total: number, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}
