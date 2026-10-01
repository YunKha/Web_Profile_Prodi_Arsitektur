import Form from "next/form";
import { Search } from "lucide-react";
import { cx } from "./primitives";

type Props = {
  action: string;
  defaultValue?: string;
  placeholder: string;
  label?: string;
  /** Parameter tersembunyi yang ikut dikirim (mis. kategori aktif). */
  hidden?: Record<string, string | undefined>;
  className?: string;
};

/** Kotak cari berbasis GET: bekerja tanpa JavaScript, URL bisa dibagikan. */
export function SearchBox({ action, defaultValue, placeholder, label = "Cari", hidden, className }: Props) {
  return (
    <Form action={action} role="search" className={cx("relative w-full sm:w-80", className)}>
      {Object.entries(hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label className="sr-only" htmlFor={`search-${action}`}>
        {label}
      </label>
      <input
        id={`search-${action}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-line-warm bg-white pl-5 pr-12 text-sm text-ink shadow-sm outline-none transition placeholder:text-grey-300 focus:border-primary focus:ring-4 focus:ring-primary-100"
      />
      <button type="submit" className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-500" aria-label="Cari">
        <Search className="size-4" />
      </button>
    </Form>
  );
}
