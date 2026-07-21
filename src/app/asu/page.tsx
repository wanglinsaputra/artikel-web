import Link from "next/link";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { countAll } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel" };

export default async function AdminHomePage() {
  await requireAdmin();
  const counts = await countAll();

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-primary sm:text-[32px]">Overview</h1>
      <p className="mt-2 text-base text-secondary">Kelola konten portal.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Artikel", value: counts.articles, href: "/asu/artikel" },
          { label: "Bansos AI", value: counts.bansos, href: "/asu/bansos" },
          { label: "Produk", value: counts.products, href: "/asu/marketplace" },
          { label: "User terdaftar", value: counts.users, href: "/asu/users" },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-secondary">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{s.value}</p>
            <Link href={s.href} className="mt-3 inline-block text-sm text-accent transition-colors hover:text-accent-hover">
              Kelola →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
