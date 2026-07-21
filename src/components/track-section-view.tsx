"use client";

import { useEffect } from "react";
import type { PortalSection } from "@/lib/db";

/** Fire-and-forget section pageview. Server cookie debounces rapid refreshes. */
export function TrackSectionView({ section }: { section: PortalSection }) {
  useEffect(() => {
    const key = `wl_sv_client_${section}`;
    try {
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last < 60_000) return; // same-tab 1 min
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // private mode — still try network
    }

    const ctrl = new AbortController();
    void fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
      keepalive: true,
      signal: ctrl.signal,
    }).catch(() => {});

    return () => ctrl.abort();
  }, [section]);

  return null;
}
