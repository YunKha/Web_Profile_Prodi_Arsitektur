"use client";

import type { ComponentProps } from "react";

/** <select> yang langsung mengirim formulirnya saat pilihan berubah (formulir GET filter). */
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
