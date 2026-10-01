import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Sanitasi HTML dari editor teks kaya sebelum disimpan. Hanya tag yang bisa
 * dihasilkan editor yang diizinkan; atribut event dan skrip dibuang.
 */
export function sanitizeRichText(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li", "blockquote", "a", "img", "hr", "code", "pre", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
        };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !/^(\/media\/|https?:\/\/)/.test(frame.attribs.src ?? ""),
  });
  // Paragraf kosong dari editor tidak perlu disimpan.
  return clean.replace(/<p>\s*<\/p>/g, "").trim();
}

export function plainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
