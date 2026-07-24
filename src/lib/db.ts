import { MongoClient, ObjectId, type Db } from "mongodb";
import { insertWithUniqueSlug } from "./slug";

export { slugify } from "./slug";

const globalForMongo = globalThis as unknown as {
  __mongoClient?: MongoClient;
  __mongoDb?: Db;
  __dbReady?: Promise<void>;
};

function uri() {
  const u = process.env.MONGODB_URI;
  if (!u) throw new Error("Missing MONGODB_URI");
  return u;
}

async function db(): Promise<Db> {
  if (!globalForMongo.__mongoDb) {
    if (!globalForMongo.__mongoClient) {
      globalForMongo.__mongoClient = new MongoClient(uri());
      await globalForMongo.__mongoClient.connect();
    }
    const name = process.env.MONGODB_DB || "wanglins";
    globalForMongo.__mongoDb = globalForMongo.__mongoClient.db(name);
  }
  return globalForMongo.__mongoDb;
}

export type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  published: number;
  created_at: string;
  updated_at: string;
};

export type Bansos = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  /** Numbered claim steps. Absent/empty on legacy posts. */
  how_to_claim?: string[];
  /** Security notes / requirements bullets. Absent/empty on legacy posts. */
  security_notes?: string[];
  provider: string;
  category: string;
  image_url: string;
  requires_login: number;
  is_hot: number;
  valid_until: string | null;
  /** Optional official CTA link. Absent on legacy posts. */
  actionUrl?: string;
  /** Optional CTA button label. Defaults to "Buka Situs Resmi" on frontend. */
  actionLabel?: string;
  views: number;
  published: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  sold: number;
  telegram_text: string;
  published: number;
  created_at: string;
  updated_at: string;
};

export type UserRole = "user" | "admin";

export type User = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  active: number;
  created_at: string;
};

function normalizeUser(item: (Partial<User> & Pick<User, "id" | "email" | "password_hash" | "created_at">) | null): User | null {
  if (!item) return null;
  return {
    id: item.id,
    username: (item.username || "").trim(),
    email: item.email,
    password_hash: item.password_hash,
    role: item.role === "admin" ? "admin" : "user",
    active: item.active === 0 ? 0 : 1,
    created_at: item.created_at,
  };
}

/** Display name: username, fallback email local-part for old rows. */
export function userDisplayName(user: Pick<User, "username" | "email">) {
  const name = (user.username || "").trim();
  if (name) return name;
  return user.email.split("@")[0] || user.email;
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function nextId(counter: string) {
  const database = await db();
  const doc = await database
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate(
      { _id: counter },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  return Number(doc?.seq ?? 1);
}

async function ensureSlugIndexes(database: Db) {
  // UNIQUE on slug = race-safe uniqueness (Mongo E11000 / Postgres 23505)
  // UNIQUE email/username prevent race-duplicate accounts
  await Promise.all([
    database.collection("articles").createIndex(
      { slug: 1 },
      { unique: true, name: "articles_slug_unique" }
    ),
    database.collection("bansos").createIndex(
      { slug: 1 },
      { unique: true, name: "bansos_slug_unique" }
    ),
    database.collection("products").createIndex(
      { slug: 1 },
      { unique: true, name: "products_slug_unique" }
    ),
    database.collection("users").createIndex(
      { email: 1 },
      { unique: true, name: "users_email_unique" }
    ),
    database.collection("users").createIndex(
      { username: 1 },
      { unique: true, name: "users_username_unique" }
    ),
    database.collection("shortlinks").createIndex(
      { code: 1 },
      { unique: true, name: "shortlinks_code_unique" }
    ),
    database.collection("shortlink_clicks").createIndex(
      { link_id: 1 },
      { name: "shortlink_clicks_link_id" }
    ),
  ]);
}

async function ensureSeed() {
  if (!globalForMongo.__dbReady) {
    globalForMongo.__dbReady = (async () => {
      const database = await db();
      const articles = database.collection<Article>("articles");
      const bansos = database.collection<Bansos>("bansos");
      const products = database.collection<Product>("products");

      await ensureSlugIndexes(database);

      if ((await articles.countDocuments()) === 0) {
        const id = await nextId("articles");
        const t = now();
        await articles.insertOne({
          id,
          title: "Selamat datang di WangLinS",
          slug: "selamat-datang-di-wanglins",
          excerpt: "Artikel contoh WangLinS. Ganti isinya kapan saja.",
          content: "Ini konten contoh WangLinS.\n\nTulis panduan AI, tools, dan workflow di sini.",
          category: "Tools",
          author: "Admin",
          image_url: "",
          published: 1,
          created_at: t,
          updated_at: t,
        });
      }

      if ((await bansos.countDocuments()) === 0) {
        const t = now();
        const a = await nextId("bansos");
        const b = await nextId("bansos");
        await bansos.insertMany([
          {
            id: a,
            title: "Contoh Bansos AI Hot",
            slug: "contoh-bansos-ai-hot",
            excerpt: "Preview singkat. Detail butuh login.",
            content: "Detail lengkap bansos AI. Hanya tampil setelah user login.",
            provider: "Contoh Provider",
            category: "Free Credit",
            image_url: "",
            requires_login: 1,
            is_hot: 1,
            valid_until: null,
            views: 0,
            published: 1,
            created_at: t,
            updated_at: t,
          },
          {
            id: b,
            title: "Contoh Bansos AI Publik",
            slug: "contoh-bansos-ai-publik",
            excerpt: "Bansos ini bisa dibaca tanpa login.",
            content: "Konten publik. Tidak butuh login.",
            provider: "Provider Publik",
            category: "API",
            image_url: "",
            requires_login: 0,
            is_hot: 0,
            valid_until: null,
            views: 0,
            published: 1,
            created_at: t,
            updated_at: t,
          },
        ]);
      }

      if ((await products.countDocuments()) === 0) {
        const id = await nextId("products");
        const t = now();
        await products.insertOne({
          id,
          title: "Contoh Token API",
          slug: "contoh-token-api",
          description: "Produk contoh marketplace. Order lewat Telegram.",
          price: 10000,
          category: "Token API",
          image_url: "",
          stock: 10,
          sold: 0,
          telegram_text: "Halo, saya mau order: Contoh Token API",
          published: 1,
          created_at: t,
          updated_at: t,
        });
      }
    })();
  }
  await globalForMongo.__dbReady;
}

function stripMongoId<T extends object>(doc: T & { _id?: unknown }): T {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = doc as T & { _id?: unknown };
  return rest as T;
}

export type ListSort = "newest" | "oldest" | "title";
export type ListStatus = "all" | "published" | "draft";

export type AdminListOpts = {
  publishedOnly?: boolean;
  category?: string;
  limit?: number;
  skip?: number;
  q?: string;
  sort?: ListSort;
  status?: ListStatus;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contentListFilter(opts?: AdminListOpts, extraTextFields: string[] = []) {
  const filter: Record<string, unknown> = {};
  if (opts?.publishedOnly || opts?.status === "published") filter.published = 1;
  else if (opts?.status === "draft") filter.published = 0;
  if (opts?.category) filter.category = opts.category;
  const q = opts?.q?.trim();
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" as const };
    const fields = ["title", "slug", "category", ...extraTextFields];
    filter.$or = fields.map((f) => ({ [f]: re }));
  }
  return filter;
}

function listSortSpec(sort?: ListSort): Record<string, 1 | -1> {
  if (sort === "oldest") return { created_at: 1 };
  if (sort === "title") return { title: 1 };
  return { created_at: -1 };
}

// --- articles ---
export async function listArticles(opts?: AdminListOpts) {
  await ensureSeed();
  const database = await db();
  const filter = contentListFilter(opts, ["excerpt", "author"]);
  let cursor = database
    .collection<Article>("articles")
    .find(filter)
    .sort(listSortSpec(opts?.sort));
  if (opts?.skip) cursor = cursor.skip(opts.skip);
  if (opts?.limit) cursor = cursor.limit(opts.limit);
  const items = await cursor.toArray();
  return items.map(stripMongoId);
}

export async function countArticles(opts?: AdminListOpts) {
  await ensureSeed();
  const database = await db();
  return database.collection("articles").countDocuments(contentListFilter(opts, ["excerpt", "author"]));
}

export async function getArticleBySlug(slug: string, publishedOnly = false) {
  await ensureSeed();
  const database = await db();
  const filter: Record<string, unknown> = { slug };
  if (publishedOnly) filter.published = 1;
  const item = await database.collection<Article>("articles").findOne(filter);
  return item ? stripMongoId(item) : null;
}

export async function articleSlugExists(slug: string) {
  await ensureSeed();
  const database = await db();
  const n = await database.collection("articles").countDocuments({ slug }, { limit: 1 });
  return n > 0;
}

export async function createArticle(
  data: Omit<Article, "id" | "slug" | "created_at" | "updated_at"> & { slug?: string }
) {
  await ensureSeed();
  const database = await db();
  const id = await nextId("articles");
  const t = now();
  return insertWithUniqueSlug(
    data.title,
    async (slug) => {
      const row: Article = {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: data.author,
        image_url: data.image_url,
        published: data.published,
        id,
        created_at: t,
        updated_at: t,
      };
      await database.collection<Article>("articles").insertOne(row);
      return row;
    },
    { fallback: "artikel", preferredSlug: data.slug }
  );
}

export async function deleteArticle(id: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("articles").deleteOne({ id });
}

export async function setArticlePublished(id: number, published: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("articles").updateOne(
    { id },
    { $set: { published, updated_at: now() } }
  );
}

export async function articleCategories() {
  const items = await listArticles({ publishedOnly: true });
  return [...new Set(items.map((x) => x.category))].sort();
}

// --- bansos ---
export async function listBansos(opts?: AdminListOpts) {
  await ensureSeed();
  const database = await db();
  const filter = contentListFilter(opts, ["excerpt", "provider"]);
  let cursor = database
    .collection<Bansos>("bansos")
    .find(filter)
    .sort(listSortSpec(opts?.sort));
  if (opts?.skip) cursor = cursor.skip(opts.skip);
  if (opts?.limit) cursor = cursor.limit(opts.limit);
  const items = await cursor.toArray();
  return items.map(stripMongoId);
}

export async function countBansos(opts?: AdminListOpts) {
  await ensureSeed();
  const database = await db();
  return database.collection("bansos").countDocuments(contentListFilter(opts, ["excerpt", "provider"]));
}

export async function getBansosBySlug(slug: string, publishedOnly = false) {
  await ensureSeed();
  const database = await db();
  const filter: Record<string, unknown> = { slug };
  if (publishedOnly) filter.published = 1;
  const item = await database.collection<Bansos>("bansos").findOne(filter);
  return item ? stripMongoId(item) : null;
}

export async function bansosSlugExists(slug: string) {
  await ensureSeed();
  const database = await db();
  const n = await database.collection("bansos").countDocuments({ slug }, { limit: 1 });
  return n > 0;
}

export async function createBansos(
  data: Omit<Bansos, "id" | "slug" | "views" | "created_at" | "updated_at"> & {
    slug?: string;
  }
) {
  await ensureSeed();
  const database = await db();
  const id = await nextId("bansos");
  const t = now();
  return insertWithUniqueSlug(
    data.title,
    async (slug) => {
      const row: Bansos = {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        provider: data.provider,
        category: data.category,
        image_url: data.image_url,
        requires_login: data.requires_login,
        is_hot: data.is_hot,
        valid_until: data.valid_until,
        published: data.published,
        id,
        views: 0,
        created_at: t,
        updated_at: t,
        ...(data.how_to_claim?.length ? { how_to_claim: data.how_to_claim } : {}),
        ...(data.security_notes?.length ? { security_notes: data.security_notes } : {}),
        ...(data.actionUrl ? { actionUrl: data.actionUrl } : {}),
        ...(data.actionLabel ? { actionLabel: data.actionLabel } : {}),
      };
      await database.collection<Bansos>("bansos").insertOne(row);
      return row;
    },
    { fallback: "bansos", preferredSlug: data.slug }
  );
}

export async function deleteBansos(id: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("bansos").deleteOne({ id });
}

export async function setBansosPublished(id: number, published: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("bansos").updateOne(
    { id },
    { $set: { published, updated_at: now() } }
  );
}

export async function bumpBansosViews(id: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("bansos").updateOne({ id }, { $inc: { views: 1 } });
}

export async function bansosCategories() {
  const items = await listBansos({ publishedOnly: true });
  return [...new Set(items.map((x) => x.category))].sort();
}

// --- products ---
export async function listProducts(opts?: AdminListOpts) {
  await ensureSeed();
  const database = await db();
  const filter = contentListFilter(opts, ["description"]);
  let cursor = database
    .collection<Product>("products")
    .find(filter)
    .sort(listSortSpec(opts?.sort));
  if (opts?.skip) cursor = cursor.skip(opts.skip);
  if (opts?.limit) cursor = cursor.limit(opts.limit);
  const items = await cursor.toArray();
  return items.map(stripMongoId);
}

export async function countProducts(opts?: AdminListOpts) {
  await ensureSeed();
  const database = await db();
  return database.collection("products").countDocuments(contentListFilter(opts, ["description"]));
}

export async function getProductBySlug(slug: string, publishedOnly = false) {
  await ensureSeed();
  const database = await db();
  const filter: Record<string, unknown> = { slug };
  if (publishedOnly) filter.published = 1;
  const item = await database.collection<Product>("products").findOne(filter);
  return item ? stripMongoId(item) : null;
}

export async function productSlugExists(slug: string) {
  await ensureSeed();
  const database = await db();
  const n = await database.collection("products").countDocuments({ slug }, { limit: 1 });
  return n > 0;
}

export async function createProduct(
  data: Omit<Product, "id" | "slug" | "sold" | "created_at" | "updated_at"> & {
    slug?: string;
  }
) {
  await ensureSeed();
  const database = await db();
  const id = await nextId("products");
  const t = now();
  return insertWithUniqueSlug(
    data.title,
    async (slug) => {
      const row: Product = {
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        category: data.category,
        image_url: data.image_url,
        stock: data.stock,
        telegram_text: data.telegram_text,
        published: data.published,
        id,
        sold: 0,
        created_at: t,
        updated_at: t,
      };
      await database.collection<Product>("products").insertOne(row);
      return row;
    },
    { fallback: "produk", preferredSlug: data.slug }
  );
}

export async function deleteProduct(id: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("products").deleteOne({ id });
}

export async function setProductPublished(id: number, published: number) {
  await ensureSeed();
  const database = await db();
  await database.collection("products").updateOne(
    { id },
    { $set: { published, updated_at: now() } }
  );
}

export async function bumpProductSold(id: number) {
  await ensureSeed();
  const database = await db();
  const item = await database.collection<Product>("products").findOne({ id });
  if (!item) return;
  await database.collection("products").updateOne(
    { id },
    {
      $inc: { sold: 1 },
      $set: {
        stock: item.stock > 0 ? item.stock - 1 : 0,
        updated_at: now(),
      },
    }
  );
}

export async function productCategories() {
  const items = await listProducts({ publishedOnly: true });
  return [...new Set(items.map((p) => p.category).filter(Boolean))].sort();
}

export type UserListOpts = {
  q?: string;
  /** role filter: all | admin | user */
  role?: "all" | "admin" | "user";
  /** active filter: all | active | inactive */
  active?: "all" | "active" | "inactive";
  sort?: ListSort | "id";
  limit?: number;
  skip?: number;
};

function userListFilter(opts?: UserListOpts) {
  const filter: Record<string, unknown> = {};
  // legacy rows: missing role => user; missing active => active
  if (opts?.role === "admin") filter.role = "admin";
  else if (opts?.role === "user") filter.role = { $ne: "admin" };
  if (opts?.active === "active") filter.active = { $ne: 0 };
  else if (opts?.active === "inactive") filter.active = 0;
  const q = opts?.q?.trim();
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" as const };
    const or: Record<string, unknown>[] = [{ username: re }, { email: re }];
    const idNum = Number(q);
    if (Number.isFinite(idNum) && String(idNum) === q) or.push({ id: idNum });
    filter.$or = or;
  }
  return filter;
}

function userSortSpec(sort?: UserListOpts["sort"]): Record<string, 1 | -1> {
  if (sort === "oldest") return { created_at: 1 };
  if (sort === "title") return { username: 1 };
  if (sort === "newest") return { created_at: -1 };
  return { id: -1 };
}

export async function listUsers(opts?: UserListOpts) {
  await ensureSeed();
  const database = await db();
  let cursor = database
    .collection<User>("users")
    .find(userListFilter(opts))
    .sort(userSortSpec(opts?.sort));
  if (opts?.skip) cursor = cursor.skip(opts.skip);
  if (opts?.limit) cursor = cursor.limit(opts.limit);
  const items = await cursor.toArray();
  return items
    .map((item) => normalizeUser(stripMongoId(item)))
    .filter((u): u is User => !!u);
}

export async function countUsers(opts?: UserListOpts) {
  await ensureSeed();
  const database = await db();
  return database.collection("users").countDocuments(userListFilter(opts));
}

export async function getUserById(id: number) {
  await ensureSeed();
  const database = await db();
  const item = await database.collection<User>("users").findOne({ id });
  return normalizeUser(item ? stripMongoId(item) : null);
}

export async function getUserByEmail(email: string) {
  await ensureSeed();
  const database = await db();
  const item = await database.collection<User>("users").findOne({ email });
  return normalizeUser(item ? stripMongoId(item) : null);
}

export async function getUserByUsername(username: string) {
  await ensureSeed();
  const database = await db();
  const item = await database
    .collection<User>("users")
    .findOne({ username: username.toLowerCase() });
  return normalizeUser(item ? stripMongoId(item) : null);
}

/** Login: username or email (case-insensitive). */
export async function getUserByLogin(login: string) {
  const key = login.trim().toLowerCase();
  if (!key) return null;
  if (key.includes("@")) return getUserByEmail(key);
  return getUserByUsername(key);
}

export async function createUser(
  username: string,
  email: string,
  password_hash: string,
  opts?: { role?: UserRole }
) {
  await ensureSeed();
  const database = await db();
  const row: User = {
    id: await nextId("users"),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password_hash,
    role: opts?.role === "admin" ? "admin" : "user",
    active: 1,
    created_at: now(),
  };
  await database.collection<User>("users").insertOne(row);
  return row;
}

export async function updateUserPassword(id: number, password_hash: string) {
  await ensureSeed();
  const database = await db();
  await database.collection<User>("users").updateOne({ id }, { $set: { password_hash } });
}

export async function setUserActive(id: number, active: number) {
  await ensureSeed();
  const database = await db();
  await database
    .collection<User>("users")
    .updateOne({ id }, { $set: { active: active ? 1 : 0 } });
}

export async function setUserRole(id: number, role: UserRole) {
  await ensureSeed();
  const database = await db();
  await database
    .collection<User>("users")
    .updateOne({ id }, { $set: { role: role === "admin" ? "admin" : "user" } });
}

export async function deleteUser(id: number) {
  await ensureSeed();
  const database = await db();
  await database.collection<User>("users").deleteOne({ id });
}

export async function countAll() {
  await ensureSeed();
  const database = await db();
  const [articles, bansos, products, users] = await Promise.all([
    database.collection("articles").countDocuments(),
    database.collection("bansos").countDocuments(),
    database.collection("products").countDocuments(),
    database.collection("users").countDocuments(),
  ]);
  return { articles, bansos, products, users };
}

export function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// --- section page views (portal categories: artikel / bansos-ai / marketplace) ---
export type PortalSection = "artikel" | "bansos-ai" | "marketplace";

export type SectionView = {
  section: PortalSection;
  views: number;
  updated_at: string;
};

export const PORTAL_SECTIONS: {
  section: PortalSection;
  title: string;
  desc: string;
  href: string;
}[] = [
  { section: "artikel", title: "Artikel", desc: "Panduan AI & tools digital.", href: "/artikel" },
  {
    section: "bansos-ai",
    title: "Bansos AI",
    desc: "Free credit & trial. Hot butuh login.",
    href: "/bansos-ai",
  },
  {
    section: "marketplace",
    title: "Marketplace",
    desc: "Token API & kredit — order Telegram.",
    href: "/marketplace",
  },
];

const SECTION_SET = new Set<string>(PORTAL_SECTIONS.map((s) => s.section));

export function isPortalSection(v: string): v is PortalSection {
  return SECTION_SET.has(v);
}

/** Increment section counter. Safe no-op on DB errors for callers that prefer soft-fail. */
export async function bumpSectionView(section: PortalSection) {
  await ensureSeed();
  const database = await db();
  const t = now();
  await database.collection<SectionView>("section_views").updateOne(
    { section },
    { $inc: { views: 1 }, $set: { updated_at: t }, $setOnInsert: { section } },
    { upsert: true }
  );
}

export async function getSectionViews(): Promise<Record<PortalSection, number>> {
  const base: Record<PortalSection, number> = {
    artikel: 0,
    "bansos-ai": 0,
    marketplace: 0,
  };
  try {
    await ensureSeed();
    const database = await db();
    const rows = await database.collection<SectionView>("section_views").find({}).toArray();
    for (const row of rows) {
      if (isPortalSection(row.section)) base[row.section] = Number(row.views) || 0;
    }
    // Reuse existing bansos item views as extra signal for bansos-ai section.
    const bansosItems = await database
      .collection<Bansos>("bansos")
      .find({ published: 1 }, { projection: { views: 1 } })
      .toArray();
    const bansosItemViews = bansosItems.reduce((sum, b) => sum + (Number(b.views) || 0), 0);
    base["bansos-ai"] += bansosItemViews;
  } catch {
    // analytics unavailable — caller falls back to static order
  }
  return base;
}

export type TrendingSection = (typeof PORTAL_SECTIONS)[number] & {
  views: number;
  rank: number;
};

/** Rank portal sections by views. Static order when all zero / unavailable. */
export async function getTrendingSections(): Promise<TrendingSection[]> {
  const views = await getSectionViews();
  const total = PORTAL_SECTIONS.reduce((s, x) => s + views[x.section], 0);
  const ranked = [...PORTAL_SECTIONS]
    .map((meta) => ({ ...meta, views: views[meta.section] }))
    .sort((a, b) => {
      if (total === 0) return 0; // keep static order
      return b.views - a.views || a.title.localeCompare(b.title);
    })
    .map((item, i) => ({ ...item, rank: i + 1 }));
  return ranked;
}

/* -------------------------------------------------------------------------- */
/* SHORTLINK SYSTEM                                                           */
/* -------------------------------------------------------------------------- */

export type ShortlinkDoc = {
  _id?: ObjectId;
  code: string;
  target_url: string;
  click_count: number;
  created_at: Date;
  expires_at: Date | null;
  active: boolean;
};

export type ShortlinkClickDoc = {
  _id?: ObjectId;
  link_id: ObjectId;
  clicked_at: Date;
  referrer: string | null;
  user_agent: string | null;
};

const RESERVED_PATHS = new Set([
  "artikel",
  "bansos-ai",
  "marketplace",
  "asu",
  "api",
  "daftar",
  "masuk",
  "login",
  "shortlink",
  "users",
]);

export async function isCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
  const normalized = code.trim();
  if (!normalized) return false;
  if (RESERVED_PATHS.has(normalized.toLowerCase())) return false;

  await ensureSeed();
  const database = await db();

  const shortlinkFilter: Record<string, unknown> = { code: normalized };
  if (excludeId && ObjectId.isValid(excludeId)) {
    shortlinkFilter._id = { $ne: new ObjectId(excludeId) };
  }
  const existingLink = await database.collection<ShortlinkDoc>("shortlinks").findOne(shortlinkFilter);
  if (existingLink) return false;

  const existingArticle = await database.collection<Article>("articles").findOne({ slug: normalized });
  if (existingArticle) return false;

  const existingBansos = await database.collection<Bansos>("bansos").findOne({ slug: normalized });
  if (existingBansos) return false;

  const existingProduct = await database.collection<Product>("products").findOne({ slug: normalized });
  if (existingProduct) return false;

  return true;
}

export async function generateRandomCode(length = 6): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (await isCodeAvailable(code)) {
      return code;
    }
  }
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (await isCodeAvailable(code)) {
      return code;
    }
  }
  throw new Error("Gagal membuat random code unik.");
}

export async function countShortlinks(opts: { q?: string; status?: string }): Promise<number> {
  await ensureSeed();
  const database = await db();
  const filter: Record<string, unknown> = {};

  if (opts.q?.trim()) {
    const q = opts.q.trim();
    filter.$or = [
      { code: { $regex: q, $options: "i" } },
      { target_url: { $regex: q, $options: "i" } },
    ];
  }

  const now = new Date();
  if (opts.status === "active") {
    filter.active = true;
    filter.$and = [
      { $or: [{ expires_at: null }, { expires_at: { $gt: now } }] }
    ];
  } else if (opts.status === "inactive") {
    filter.active = false;
  } else if (opts.status === "expired") {
    filter.active = true;
    filter.expires_at = { $ne: null, $lte: now };
  }

  return database.collection<ShortlinkDoc>("shortlinks").countDocuments(filter);
}

export async function listShortlinks(opts: {
  q?: string;
  status?: string;
  skip?: number;
  limit?: number;
}): Promise<ShortlinkDoc[]> {
  await ensureSeed();
  const database = await db();
  const filter: Record<string, unknown> = {};

  if (opts.q?.trim()) {
    const q = opts.q.trim();
    filter.$or = [
      { code: { $regex: q, $options: "i" } },
      { target_url: { $regex: q, $options: "i" } },
    ];
  }

  const now = new Date();
  if (opts.status === "active") {
    filter.active = true;
    filter.$and = [
      { $or: [{ expires_at: null }, { expires_at: { $gt: now } }] }
    ];
  } else if (opts.status === "inactive") {
    filter.active = false;
  } else if (opts.status === "expired") {
    filter.active = true;
    filter.expires_at = { $ne: null, $lte: now };
  }

  const items = await database
    .collection<ShortlinkDoc>("shortlinks")
    .find(filter)
    .sort({ created_at: -1 })
    .skip(opts.skip || 0)
    .limit(opts.limit || 10)
    .toArray();

  return items;
}

export async function getShortlinkByCode(code: string): Promise<ShortlinkDoc | null> {
  await ensureSeed();
  const database = await db();
  return database.collection<ShortlinkDoc>("shortlinks").findOne({ code });
}

export async function getShortlinkById(id: string): Promise<ShortlinkDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  await ensureSeed();
  const database = await db();
  return database.collection<ShortlinkDoc>("shortlinks").findOne({ _id: new ObjectId(id) });
}

export async function createShortlink(data: {
  code?: string;
  target_url: string;
  expires_at?: Date | null;
  active?: boolean;
}): Promise<ShortlinkDoc> {
  await ensureSeed();
  const database = await db();

  let code = data.code?.trim();
  if (!code) {
    code = await generateRandomCode();
  } else {
    const available = await isCodeAvailable(code);
    if (!available) {
      throw new Error(`Kode "${code}" sudah digunakan atau merupakan kata cadangan sistem.`);
    }
  }

  const doc: ShortlinkDoc = {
    code,
    target_url: data.target_url.trim(),
    click_count: 0,
    created_at: new Date(),
    expires_at: data.expires_at || null,
    active: data.active !== false,
  };

  const res = await database.collection<ShortlinkDoc>("shortlinks").insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function updateShortlink(
  id: string,
  data: {
    code?: string;
    target_url?: string;
    expires_at?: Date | null;
    active?: boolean;
  }
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  await ensureSeed();
  const database = await db();

  const updates: Partial<ShortlinkDoc> = {};

  if (data.target_url !== undefined) {
    updates.target_url = data.target_url.trim();
  }
  if (data.active !== undefined) {
    updates.active = data.active;
  }
  if (data.expires_at !== undefined) {
    updates.expires_at = data.expires_at;
  }
  if (data.code !== undefined && data.code.trim()) {
    const newCode = data.code.trim();
    const available = await isCodeAvailable(newCode, id);
    if (!available) {
      throw new Error(`Kode "${newCode}" sudah digunakan atau merupakan kata cadangan sistem.`);
    }
    updates.code = newCode;
  }

  if (Object.keys(updates).length === 0) return true;

  const res = await database
    .collection<ShortlinkDoc>("shortlinks")
    .updateOne({ _id: new ObjectId(id) }, { $set: updates });

  return res.modifiedCount > 0;
}

export async function deleteShortlink(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  await ensureSeed();
  const database = await db();
  const _id = new ObjectId(id);

  await database.collection("shortlink_clicks").deleteMany({ link_id: _id });
  const res = await database.collection("shortlinks").deleteOne({ _id });
  return res.deletedCount > 0;
}

export async function recordShortlinkClick(opts: {
  link_id: ObjectId;
  referrer: string | null;
  user_agent: string | null;
}): Promise<void> {
  try {
    const database = await db();
    await Promise.all([
      database
        .collection<ShortlinkDoc>("shortlinks")
        .updateOne({ _id: opts.link_id }, { $inc: { click_count: 1 } }),
      database.collection<ShortlinkClickDoc>("shortlink_clicks").insertOne({
        link_id: opts.link_id,
        clicked_at: new Date(),
        referrer: opts.referrer,
        user_agent: opts.user_agent,
      }),
    ]);
  } catch (err) {
    console.error("Failed to record shortlink click:", err);
  }
}
