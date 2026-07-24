# WangLinS (website-artikel)

Portal AI **WangLinS**: artikel, bansos AI, marketplace, auth user, dashboard admin (`/asu`).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4
- MongoDB Atlas (`mongodb` driver) — siap Vercel
- Admin: cookie session + `ADMIN_PASSWORD` dari env
- User: daftar / masuk (email disposable diblok via `mailchecker`)
- Order marketplace: redirect Telegram
- Slug unik: index UNIQUE + retry `-2`, `-3`, … (race-safe)

## Setup

1. Cluster di [cloud.mongodb.com](https://cloud.mongodb.com)
2. Database Access → user + password
3. Network Access → IP kamu (atau `0.0.0.0/0` untuk dev)
4. Connect → Drivers → copy connection string

```bash
npm install
cp .env.example .env.local
# isi MONGODB_URI, ADMIN_PASSWORD, SESSION_SECRET, TELEGRAM_USERNAME
npm run dev
```

- Situs: http://localhost:3000
- Admin: http://localhost:3000/asu/login  
  Default dev password: nilai di `.env.local` (contoh di `.env.example`)

Production menolak secret default — set password/secret kuat.

## Scripts

| Command | Fungsi |
|---------|--------|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production |
| `npm run lint` | ESLint |
| `npm test` | Unit test (`slug`, `email`) |
| `npm run migrate:slugs` | Backfill slug kosong + unique index |

```bash
MONGODB_URI="mongodb+srv://..." npm run migrate:slugs
```

## Deploy Vercel

Env di project settings:

```
ADMIN_PASSWORD
SESSION_SECRET
TELEGRAM_USERNAME
MONGODB_URI
MONGODB_DB
NEXT_PUBLIC_SITE_URL        # opsional, metadata base URL
NEXT_PUBLIC_ADSENSE_PUB_ID  # opsional, Google AdSense publisher ID
```

## Fitur

| Modul | Public | Admin (`/asu`) |
|-------|--------|----------------|
| Artikel | list + detail (slug) | CRUD / publish / delete |
| Bansos AI | list + detail; login wall jika `requires_login` | CRUD + flag login/hot + CTA opsional |
| Marketplace | list + detail + tombol Telegram | CRUD / stok / +1 terjual |
| User | daftar / masuk | directory: role, password, aktif |
| Views | track section view | overview di dashboard |

## Env

Salin dari `.env.example`:

```
ADMIN_PASSWORD=...
SESSION_SECRET=...              # string panjang acak (≥32)
TELEGRAM_USERNAME=username      # tanpa @
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=wanglins
# NEXT_PUBLIC_SITE_URL=https://example.com
```

## Struktur

```
src/app/           # public pages + /asu dashboard + API routes
src/components/    # UI shared (header, admin shell, forms)
src/lib/           # db, auth, slug, email, admin helpers
scripts/           # migrate-slugs.mjs
public/            # static assets
```

## Data (MongoDB)

Collections: `articles`, `bansos`, `products`, `users`, `counters`.

- `slug` di articles/bansos/products — unique index (`*_slug_unique`)
- Seed contoh otomatis saat DB kosong
- Slug dari title (`src/lib/slug.ts`); conflict → suffix `-2`, `-3`, …

## Catatan

- QRIS otomatis: belum. Order = link `t.me/...`
- Design tokens: `DESIGN.MD`
- Agent notes: `AGENTS.md`, `.github/copilot-instructions.md`
- Jangan commit `.env.local` / secrets

## Lisensi

[Apache License 2.0](LICENSE) — lihat file `LICENSE` untuk syarat lengkap.
