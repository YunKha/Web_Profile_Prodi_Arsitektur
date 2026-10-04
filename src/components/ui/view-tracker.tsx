"use client";

import { useEffect } from "react";

const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 jam

/** Mencatat satu tayangan per sesi browser untuk berita/penelitian. */
export function ViewTracker({ type, id }: { type: "news" | "research"; id: number }) {
  useEffect(() => {
    const key = `abala:viewed:${type}:${id}`;
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (Date.now() - timestamp < EXPIRATION_MS) {
          return;
        }
      }
      localStorage.setItem(key, Date.now().toString());
    } catch {
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        // Abaikan jika keduanya diblokir
      }
    }
    
    navigator.sendBeacon?.("/api/views", new Blob([JSON.stringify({ type, id })], { type: "application/json" }));
  }, [type, id]);
  return null;
}
