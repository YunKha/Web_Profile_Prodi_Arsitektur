"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { slugify } from "@/lib/slug";
import { cx } from "@/components/ui/primitives";
import { useFieldError } from "./admin-form";

export const inputClass =
  "w-full rounded-xl border border-[#d6d3d1] bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-grey-300 focus:border-primary focus:ring-4 focus:ring-primary-100 disabled:bg-grey-100 aria-[invalid=true]:border-[#f04438] aria-[invalid=true]:ring-[#fee4e2]";

type Base = { name: string; label: string; hint?: ReactNode; required?: boolean; className?: string };

export function Field({ name, label, hint, required, className, children, id }: Base & { children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode; id?: string }) {
  const auto = useId();
  const fieldId = id ?? `${auto}-${name}`;
  const error = useFieldError(name);
  const hintId = `${fieldId}-hint`;
  const errId = `${fieldId}-err`;
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-[#d92d20]"> *</span> : null}
      </label>
      {children({ id: fieldId, invalid: Boolean(error), describedBy: [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="text-xs font-semibold text-[#d92d20]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  defaultValue,
  type = "text",
  placeholder,
  maxLength,
  autoComplete,
  list,
  ...base
}: Base & { defaultValue?: string | number | null; type?: string; placeholder?: string; maxLength?: number; autoComplete?: string; list?: string }) {
  return (
    <Field {...base}>
      {({ id, invalid, describedBy }) => (
        <input
          id={id}
          name={base.name}
          type={type}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          list={list}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={inputClass}
        />
      )}
    </Field>
  );
}

export function TextAreaField({ defaultValue, rows = 4, placeholder, maxLength, ...base }: Base & { defaultValue?: string | null; rows?: number; placeholder?: string; maxLength?: number }) {
  const [count, setCount] = useState((defaultValue ?? "").length);
  return (
    <Field
      {...base}
      hint={
        maxLength ? (
          <span className="flex justify-between gap-4">
            <span>{base.hint}</span>
            <span className={cx(count > maxLength && "text-[#d92d20]")}>
              {count}/{maxLength}
            </span>
          </span>
        ) : (
          base.hint
        )
      }
    >
      {({ id, invalid, describedBy }) => (
        <textarea
          id={id}
          name={base.name}
          rows={rows}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          onChange={(e) => setCount(e.target.value.length)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cx(inputClass, "resize-y leading-6")}
        />
      )}
    </Field>
  );
}

export function SelectField({
  options,
  defaultValue,
  placeholder,
  ...base
}: Base & { options: { value: string | number; label: string }[]; defaultValue?: string | number | null; placeholder?: string }) {
  return (
    <Field {...base}>
      {({ id, invalid, describedBy }) => (
        <select id={id} name={base.name} defaultValue={defaultValue == null ? "" : String(defaultValue)} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass}>
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function CheckboxField({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--primary-400)]" />
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </label>
    </div>
  );
}

export function StatusField({ defaultValue = "draft" }: { defaultValue?: string }) {
  const error = useFieldError("status");
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold text-ink">Status</legend>
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: "draft", l: "Draf", d: "Hanya terlihat di admin" },
          { v: "published", l: "Terbit", d: "Tampil di website" },
        ].map((o) => (
          <label key={o.v} className="flex cursor-pointer flex-col rounded-xl border border-[#d6d3d1] bg-white px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary-100">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="radio" name="status" value={o.v} defaultChecked={defaultValue === o.v} className="accent-[var(--primary-400)]" />
              {o.l}
            </span>
            <span className="pl-6 text-xs text-muted">{o.d}</span>
          </label>
        ))}
      </div>
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
    </fieldset>
  );
}

/**
 * Judul + slug: slug terisi otomatis dari judul selama belum diedit manual
 * (hanya untuk data baru; untuk data lama slug tidak diubah otomatis agar URL stabil).
 */
export function TitleSlugFields({
  titleName = "title",
  titleLabel = "Judul",
  defaultTitle,
  defaultSlug,
  slugPrefix,
  maxLength = 300,
}: {
  titleName?: string;
  titleLabel?: string;
  defaultTitle?: string | null;
  defaultSlug?: string | null;
  slugPrefix: string;
  maxLength?: number;
}) {
  const isNew = !defaultSlug;
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const touched = useRef(!isNew);
  return (
    <div className="flex flex-col gap-4">
      <Field name={titleName} label={titleLabel} required>
        {({ id, invalid, describedBy }) => (
          <input
            id={id}
            name={titleName}
            defaultValue={defaultTitle ?? ""}
            maxLength={maxLength}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(e) => {
              if (!touched.current) setSlug(slugify(e.target.value));
            }}
            className={cx(inputClass, "font-display text-base font-bold")}
          />
        )}
      </Field>
      <Field name="slug" label="Slug (alamat URL)" required hint={<span className="break-all">{slugPrefix}{slug || "…"}</span>}>
        {({ id, invalid, describedBy }) => (
          <div className="flex gap-2">
            <input
              id={id}
              name="slug"
              value={slug}
              onChange={(e) => {
                touched.current = true;
                setSlug(e.target.value);
              }}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={cx(inputClass, "font-mono text-xs")}
            />
            <button
              type="button"
              title="Buat ulang dari judul"
              aria-label="Buat ulang slug dari judul"
              onClick={(e) => {
                const form = e.currentTarget.form;
                const title = (form?.elements.namedItem(titleName) as HTMLInputElement | null)?.value ?? "";
                setSlug(slugify(title));
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#d6d3d1] bg-white text-ink-soft hover:text-primary"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        )}
      </Field>
      {!isNew ? <p className="-mt-2 text-xs text-[#b54708]">Mengubah slug akan mengubah alamat halaman; tautan lama tidak lagi berfungsi.</p> : null}
    </div>
  );
}

/** Kartu pengelompok field di formulir. */
export function FormSection({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6", className)}>
      <header className="mb-5">
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Tata letak formulir: kolom utama + sidebar (status, gambar, simpan). */
export function FormLayout({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">{main}</div>
      <div className="flex flex-col gap-6 xl:sticky xl:top-24">{side}</div>
    </div>
  );
}
