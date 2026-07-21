/** URL-safe slug helpers. DB-agnostic. */

const MAX_SLUG_LEN = 200;

/** Lowercase, spaces→-, strip specials, collapse/trim hyphens. */
export function slugify(input: string, fallback = "item"): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LEN)
    .replace(/-$/g, "");
  return base || fallback;
}

/** base, then base-2, base-3, ... (never base-1). */
export function slugWithSuffix(base: string, attempt: number): string {
  if (attempt <= 1) return base;
  const suffix = `-${attempt}`;
  const maxBase = MAX_SLUG_LEN - suffix.length;
  const trimmed = base.slice(0, Math.max(1, maxBase)).replace(/-$/g, "");
  return `${trimmed}${suffix}`;
}

/** True if error is unique/duplicate-key (Mongo 11000 or Postgres 23505). */
export function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    code?: number | string;
    codeName?: string;
    message?: string;
  };
  if (e.code === 11000 || e.code === "11000") return true;
  if (e.code === "23505") return true;
  if (e.codeName === "DuplicateKey") return true;
  if (typeof e.message === "string" && /E11000|duplicate key/i.test(e.message)) {
    return true;
  }
  return false;
}

export type InsertWithSlugFn<T> = (slug: string) => Promise<T>;

/**
 * Insert with unique slug. DB UNIQUE on slug is source of truth.
 * On unique violation, retry next suffix. No pre-SELECT required.
 */
export async function insertWithUniqueSlug<T>(
  title: string,
  insert: InsertWithSlugFn<T>,
  opts?: { fallback?: string; maxAttempts?: number; preferredSlug?: string }
): Promise<T> {
  const base = slugify(opts?.preferredSlug || title, opts?.fallback ?? "item");
  const max = opts?.maxAttempts ?? 50;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= max; attempt++) {
    const slug = slugWithSuffix(base, attempt);
    try {
      return await insert(slug);
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      lastErr = err;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Could not allocate unique slug for "${base}" after ${max} attempts`);
}
