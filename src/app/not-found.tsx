import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  description: "Halaman yang kamu cari tidak ditemukan di WangLinS.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
