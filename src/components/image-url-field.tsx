"use client";

import { useState } from "react";

export function ImageUrlField({
  name = "image_url",
  defaultValue = "",
  placeholder = "https://... link gambar",
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [broken, setBroken] = useState(false);

  return (
    <div className="space-y-2">
      <input
        name={name}
        value={url}
        onChange={(e) => {
          setUrl(e.target.value.trimStart());
          setBroken(false);
        }}
        placeholder={placeholder}
        className="field"
      />
      {url ? (
        <div className="overflow-hidden rounded-xl border border-border bg-base/40">
          {broken ? (
            <p className="alert alert-error m-0 rounded-none border-0 px-3 py-6 text-center text-[13px]">
              Gambar gagal dimuat. Cek URL.
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Preview"
              className="max-h-48 w-full object-cover"
              onError={() => setBroken(true)}
            />
          )}
        </div>
      ) : (
        <p className="text-[13px] text-muted">Preview muncul setelah isi link gambar.</p>
      )}
    </div>
  );
}
