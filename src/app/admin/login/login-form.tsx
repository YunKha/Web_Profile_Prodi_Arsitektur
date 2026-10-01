"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { login } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null);
  const [show, setShow] = useState(false);
  const input =
    "h-12 w-full rounded-xl border border-line-warm bg-white px-4 text-sm text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-100";

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next ?? ""} />
      {state?.message ? (
        <p role="alert" className="rounded-xl border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm font-medium text-[#b42318]">
          {state.message}
        </p>
      ) : null}
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input name="email" type="email" autoComplete="username" required autoFocus className={input} placeholder="nama@untad.ac.id" />
      </label>
      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-sm font-semibold text-ink">
          Kata sandi
        </label>
        <span className="relative">
          <input id="login-password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${input} pr-12`} />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-primary-500 disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Masuk
      </button>
    </form>
  );
}
