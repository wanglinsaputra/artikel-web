/**
 * Migration: ensure unique slug indexes on articles/bansos/products.
 * Also backfills missing/empty slugs from title.
 *
 * Usage:
 *   npm run migrate:slugs
 *   # or: MONGODB_URI=... node scripts/migrate-slugs.mjs
 *
 * Loads .env.local then .env from project root (does not override existing env).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function slugify(input, fallback = "item") {
  const base = String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || fallback;
}

function withSuffix(base, n) {
  return n <= 1 ? base : `${base}-${n}`;
}

async function uniqueSlug(col, title, excludeId) {
  const base = slugify(title, "item");
  for (let n = 1; n <= 100; n++) {
    const slug = withSuffix(base, n);
    const q = { slug };
    if (excludeId != null) q.id = { $ne: excludeId };
    const exists = await col.findOne(q, { projection: { _id: 1 } });
    if (!exists) return slug;
  }
  throw new Error(`no free slug for ${title}`);
}

async function migrateCollection(db, name) {
  const col = db.collection(name);
  const docs = await col.find({}).toArray();
  let fixed = 0;
  const seen = new Map();

  for (const doc of docs) {
    let slug = typeof doc.slug === "string" ? doc.slug.trim() : "";
    if (!slug) {
      slug = await uniqueSlug(col, doc.title || name, doc.id);
      await col.updateOne({ _id: doc._id }, { $set: { slug } });
      fixed++;
    }
    if (seen.has(slug)) {
      const next = await uniqueSlug(col, doc.title || slug, doc.id);
      await col.updateOne({ _id: doc._id }, { $set: { slug: next } });
      seen.set(next, true);
      fixed++;
    } else {
      seen.set(slug, true);
    }
  }

  await col.createIndex({ slug: 1 }, { unique: true, name: `${name}_slug_unique` });
  console.log(`${name}: docs=${docs.length} fixed=${fixed} index=${name}_slug_unique`);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI (set in .env.local or env)");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "wanglins");
for (const name of ["articles", "bansos", "products"]) {
  await migrateCollection(db, name);
}
await client.close();
console.log("done");
