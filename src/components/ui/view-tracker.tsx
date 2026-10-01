"use client";

import { useEffect } from "react";

/** Mencatat satu tayangan per sesi browser untuk berita/penelitian. */
export function ViewTracker({ type, id }: { type: "news" | "research"; id: number }) {
  useEffect(() => {
    const key = `viewed:${type}:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage bisa diblokir; tetap kirim sekali.
    }
    navigator.sendBeacon?.("/api/views", new Blob([JSON.stringify({ type, id })], { type: "application/json" }));
  }, [type, id]);
  return null;
}
