"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { CopyButton } from "@/components/copy-button";
import { Badge, Card } from "@/components/ui";

export type ShortlinkItemProps = {
  item: {
    _id: string;
    code: string;
    target_url: string;
    click_count: number;
    created_at: string | Date;
    expires_at: string | Date | null;
    active: boolean;
  };
  baseUrl: string;
  toggleActiveAction: (formData: FormData) => void | Promise<void>;
  deleteShortlinkAction: (formData: FormData) => void | Promise<void>;
};

function formatDatetimeLocal(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ShortlinkItemCard({
  item,
  baseUrl,
  toggleActiveAction,
  deleteShortlinkAction,
}: ShortlinkItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [targetUrl, setTargetUrl] = useState(item.target_url);
  const [code, setCode] = useState(item.code);
  const [expiresAt, setExpiresAt] = useState(formatDatetimeLocal(item.expires_at));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullShortUrl = baseUrl ? `${baseUrl}/${item.code}` : `/${item.code}`;
  const now = new Date();
  const isExpired = item.expires_at && new Date(item.expires_at) <= now;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedUrl = targetUrl.trim();
    const trimmedCode = code.trim();

    if (!trimmedUrl) {
      setError("URL Target wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/shortlink/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: trimmedUrl,
          code: trimmedCode,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      const json = await res.json() as { ok: boolean; error?: string };

      if (!res.ok || !json.ok) {
        let msg = json.error || "Gagal memperbarui shortlink.";
        if (msg === "invalid_target_url") {
          msg = "URL tidak valid. Harus diawali http:// atau https://";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      setIsEditing(false);
      setError(null);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setTargetUrl(item.target_url);
    setCode(item.code);
    setExpiresAt(formatDatetimeLocal(item.expires_at));
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold text-accent">{item.code}</span>
            {isExpired ? (
              <Badge tone="hot">Expired</Badge>
            ) : item.active ? (
              <Badge tone="default">Aktif</Badge>
            ) : (
              <Badge tone="hot">Nonaktif</Badge>
            )}
            <span className="text-xs text-muted">
              {item.click_count} klik
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-sm text-secondary">
              {fullShortUrl}
            </span>
            <CopyButton text={fullShortUrl} label="Salin Shortlink" />
          </div>

          <p className="truncate text-xs text-muted" title={item.target_url}>
            Target: <span className="underline">{item.target_url}</span>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
            <span>
              Dibuat: {new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {item.expires_at ? (
              <span>
                Kadaluarsa: {new Date(item.expires_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="btn-ghost min-h-10 px-3 text-xs"
          >
            {isEditing ? "Tutup Form" : "Edit"}
          </button>

          <a
            href={`/${item.code}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost min-h-10 px-3 text-xs"
          >
            Uji Link ↗
          </a>

          <form action={toggleActiveAction}>
            <input type="hidden" name="id" value={item._id} />
            <input type="hidden" name="active" value={String(item.active)} />
            <button type="submit" className="btn-ghost min-h-10 px-3 text-xs">
              {item.active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </form>

          <ConfirmDeleteButton
            action={deleteShortlinkAction}
            id={item._id}
            label="Hapus"
            message={`Yakin hapus shortlink ${item.code}? Tautan tidak dapat diakses lagi.`}
          />
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mt-2 border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-primary">Edit Shortlink: {item.code}</h3>

          {error ? (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400">
              ⚠️ {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-secondary">
                URL Target <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
                className="field w-full"
                placeholder="https://example.com/target"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                Kode Shortlink <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="field w-full font-mono text-sm"
                placeholder="aB3xZ9"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                Tanggal Kadaluarsa (Opsional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="field w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-ghost min-h-10 px-4 text-xs"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary min-h-10 px-5 text-xs"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      ) : null}
    </Card>
  );
}
