"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Unlink,
} from "lucide-react";
import { cx } from "@/components/ui/primitives";
import { useFieldError } from "./admin-form";
import { MediaDialog } from "./media-picker";

function ToolButton({ onClick, active, disabled, label, children }: { onClick: () => void; active?: boolean; disabled?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cx(
        "flex size-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-white hover:text-ink disabled:opacity-30",
        active && "bg-white text-primary shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      ul: e.isActive("bulletList"),
      ol: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Alamat tautan (https://… atau /halaman)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-background px-2 py-1.5">
      <ToolButton label="Tebal" active={s.bold} onClick={() => c().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Miring" active={s.italic} onClick={() => c().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Coret" active={s.strike} onClick={() => c().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <ToolButton label="Judul bagian" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="Subjudul" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      <ToolButton label="Daftar berpoin" active={s.ul} onClick={() => c().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Daftar bernomor" active={s.ol} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Kutipan" active={s.quote} onClick={() => c().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="Garis pemisah" onClick={() => c().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <ToolButton label="Tautan" active={s.link} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      <ToolButton label="Hapus tautan" disabled={!s.link} onClick={() => c().unsetLink().run()}>
        <Unlink className="size-4" />
      </ToolButton>
      <ToolButton label="Sisipkan gambar" onClick={onImage}>
        <ImagePlus className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <ToolButton label="Urungkan" disabled={!s.canUndo} onClick={() => c().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Ulangi" disabled={!s.canRedo} onClick={() => c().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>
    </div>
  );
}

/** Editor teks kaya. HTML disimpan ke input tersembunyi dan disanitasi di server. */
export function RichTextField({ name, label, defaultValue, hint, required, placeholder }: { name: string; label: string; defaultValue?: string | null; hint?: string; required?: boolean; placeholder?: string }) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const [imageOpen, setImageOpen] = useState(false);
  const error = useFieldError(name);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto", "tel"] }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Tulis isi di sini…" }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        class: "prose-content min-h-[320px] px-5 py-4 outline-none [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-grey-300 [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
      },
    },
    onUpdate: ({ editor: e }) => {
      setHtml(e.isEmpty ? "" : e.getHTML());
      // Beri tahu AdminForm bahwa ada perubahan (untuk peringatan "belum disimpan").
      e.view.dom.closest("form")?.dispatchEvent(new Event("change", { bubbles: true }));
    },
  });

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-[#d92d20]"> *</span> : null}
      </span>
      <input type="hidden" name={name} value={html} />
      <div className={cx("overflow-hidden rounded-xl border bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-100", error ? "border-[#f04438]" : "border-[#d6d3d1]")}>
        {editor ? <Toolbar editor={editor} onImage={() => setImageOpen(true)} /> : <div className="h-11 border-b border-line bg-background" />}
        <EditorContent editor={editor} />
      </div>
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
      <MediaDialog
        open={imageOpen}
        kind="image"
        onClose={() => setImageOpen(false)}
        onSelect={([m]) => {
          if (m) editor?.chain().focus().setImage({ src: `/media/${m.path}`, alt: m.altText ?? "" }).run();
        }}
      />
    </div>
  );
}
