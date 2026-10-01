import { stripHtml } from "@/lib/format";
import { listLatestNews } from "@/lib/queries/content";
import { siteFullName, siteUrl } from "@/lib/site";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Umpan RSS 20 berita terbaru. */
export async function GET() {
  const items = await listLatestNews(20);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${esc(`Berita ${siteFullName}`)}</title>
<link>${siteUrl}/berita</link>
<description>Berita terbaru Program Studi Arsitektur Universitas Tadulako</description>
<language>id</language>
${items
  .map((n) => {
    const link = `${siteUrl}/berita/${n.slug}`;
    return `<item><title>${esc(n.title)}</title><link>${link}</link><guid>${link}</guid>${
      n.publishedAt ? `<pubDate>${n.publishedAt.toUTCString()}</pubDate>` : ""
    }<description>${esc(stripHtml(n.excerpt))}</description></item>`;
  })
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
