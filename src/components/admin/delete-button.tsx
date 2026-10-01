"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Trash } from "lucide-react";
import { cx } from "@/components/ui/primitives";

/**
 * Tombol hapus dengan konfirmasi. `action` adalah Server Action yang sudah
 * di-bind dengan id; mengembalikan pesan bila gagal, atau redirect bila sukses.
 */
export function DeleteButton({
  action,
  label = "Hapus",
  confirm = "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
  compact = false,
}: {
  action: () => Promise<{ ok: boolean; message?: string } | void>;
  label?: string;
  confirm?: string;
  compact?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirm)) return;
          setError(null);
          start(async () => {
            const res = await action();
            if (res && !res.ok) setError(res.message ?? "Gagal menghapus.");
          });
        }}
        className={cx(
          "inline-flex items-center gap-1.5 rounded-lg font-semibold text-[#d92d20] transition hover:bg-[#fef3f2] disabled:opacity-50",
          compact ? "size-8 justify-center" : "h-10 border border-[#fecdca] bg-white px-4 text-sm",
        )}
        aria-label={compact ? label : undefined}
        title={label}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash className="size-4" />}
        {compact ? null : label}
      </button>
      {error ? (
        <span role="alert" className="max-w-56 text-right text-xs font-semibold text-[#d92d20]">
          {error}
        </span>
      ) : null}
    </span>
  );
}
