"use client";

import { createContext, startTransition, use, useActionState, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { CircleCheck, LoaderCircle, Save, TriangleAlert } from "lucide-react";
import type { FormState } from "@/lib/admin/form";
import { cx } from "@/components/ui/primitives";

type Ctx = { errors: Record<string, string>; pending: boolean };
const FormContext = createContext<Ctx>({ errors: {}, pending: false });

export function useFieldError(name: string) {
  return use(FormContext).errors[name];
}

/** Galat untuk field ini atau salah satu isinya (mis. "certifications.0.number"), beserta nomor barisnya. */
export function useNestedFieldError(name: string): string | undefined {
  const errors = use(FormContext).errors;
  if (errors[name]) return errors[name];
  const key = Object.keys(errors).find((k) => k.startsWith(`${name}.`));
  if (!key) return undefined;
  const row = Number(key.split(".")[1]);
  return Number.isInteger(row) ? `Baris ${row + 1}: ${errors[key]}` : errors[key];
}

export function useFormPending() {
  return use(FormContext).pending;
}

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Formulir admin. Dikirim lewat transition (bukan atribut `action`) sehingga
 * React tidak me-reset isian ketika validasi server gagal.
 */
export function AdminForm({ action, children, className, id }: { action: Action; children: ReactNode; className?: string; id?: string }) {
  const [state, dispatch, pending] = useActionState(action, null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (state && !state.ok && state.errors) {
      const first = Object.keys(state.errors)[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  }, [state]);

  return (
    <FormContext value={{ errors: state?.errors ?? {}, pending }}>
      <form
        id={id}
        noValidate
        className={cx("flex flex-col gap-6", className)}
        onChange={() => setDirty(true)}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setDirty(false);
          startTransition(() => dispatch(fd));
        }}
      >
        {state?.message ? <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert> : null}
        {children}
      </form>
    </FormContext>
  );
}

export function Alert({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const styles = {
    success: "border-[#abefc6] bg-[#ecfdf3] text-[#067647]",
    error: "border-[#fecdca] bg-[#fef3f2] text-[#b42318]",
    info: "border-primary-200 bg-primary-100 text-primary-600",
  };
  const Icon = tone === "success" ? CircleCheck : TriangleAlert;
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cx("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium", styles[tone])}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

const noopSubscribe = () => () => {};

/** false selama render server & hydration, true setelah JavaScript aktif. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function SubmitButton({ children = "Simpan", className }: { children?: ReactNode; className?: string }) {
  const pending = useFormPending();
  // Tombol aktif setelah hydration agar klik tidak terkirim sebelum formulir siap
  // (di koneksi lambat, klik terlalu cepat menyimpan data tanpa berpindah halaman).
  const hydrated = useHydrated();
  return (
    <button
      type="submit"
      disabled={pending || !hydrated}
      className={cx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm transition hover:bg-primary-500 disabled:opacity-60",
        className,
      )}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
      {pending ? "Menyimpan…" : children}
    </button>
  );
}
