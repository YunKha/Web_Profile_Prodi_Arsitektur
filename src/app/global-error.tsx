"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fafaf9", color: "#1c1917", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>Terjadi kesalahan</h1>
          <p style={{ color: "#57534e" }}>Maaf, website sedang mengalami gangguan.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, background: "#af640e", color: "#fff", border: 0, borderRadius: 999, padding: "12px 28px", fontWeight: 700, cursor: "pointer" }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
