"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Send } from "lucide-react";

/** Tombol bagikan: WhatsApp, Telegram, dan salin tautan. */
export function ShareButtons({ title, label = "Bagikan" }: { title: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function shareUrl(kind: "wa" | "tg") {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    return kind === "wa" ? `https://wa.me/?text=${text}%20${url}` : `https://t.me/share/url?url=${url}&text=${text}`;
  }

  const btn = "flex size-10 items-center justify-center rounded-full border border-line-warm bg-white text-ink-soft transition hover:border-primary hover:text-primary";

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted">{label}</span>
      <div className="flex gap-3">
        <button type="button" className={btn} aria-label="Bagikan ke WhatsApp" onClick={() => window.open(shareUrl("wa"), "_blank", "noopener")}>
          <MessageCircle className="size-4" />
        </button>
        <button type="button" className={btn} aria-label="Bagikan ke Telegram" onClick={() => window.open(shareUrl("tg"), "_blank", "noopener")}>
          <Send className="size-4" />
        </button>
        <button
          type="button"
          className={btn}
          aria-label="Salin tautan"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check className="size-4 text-primary" /> : <Link2 className="size-4" />}
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Tautan disalin" : ""}
      </span>
    </div>
  );
}
