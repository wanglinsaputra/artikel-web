import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan · WangLinS",
  description: "Halaman yang kamu cari tidak ditemukan di WangLinS.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <NotFoundView />
      </main>
      <SiteFooter />
    </>
  );
}
