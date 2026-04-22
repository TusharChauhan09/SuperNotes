"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { cn } from "@/lib/utils";

const SAVE_DEBOUNCE_MS = 1000;

export function TextEditor({
  noteId,
  initialContent,
  onSave,
}: {
  noteId: string;
  initialContent: unknown;
  onSave: (content: unknown) => void;
}) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Image.configure({ inline: false, allowBase64: true }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content:
        initialContent &&
        typeof initialContent === "object" &&
        Object.keys(initialContent as object).length > 0
          ? (initialContent as object)
          : { type: "doc", content: [] },
      editorProps: {
        attributes: {
          class: cn(
            "prose-editor max-w-[var(--layout-editor-max)] mx-auto focus:outline-none",
            "min-h-[60vh] px-12 py-10"
          ),
        },
      },
      immediatelyRender: false,
      onUpdate: ({ editor: e }) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          onSave(e.getJSON());
        }, SAVE_DEBOUNCE_MS);
      },
    },
    [noteId]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (
    label: string,
    active: boolean,
    onClick: () => void,
    disabled = false
  ) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-[11px] font-medium transition",
        active
          ? "bg-[rgba(16,185,129,0.1)] text-emerald-300"
          : "text-[#8a9e94] hover:bg-[#1a1d1c] hover:text-[#c8d8d2]",
        disabled && "opacity-40"
      )}
    >
      {label}
    </button>
  );

  const insertImage = () => {
    const url = prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div
      className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[rgba(16,185,129,0.07)] px-6 py-2 backdrop-blur"
      style={{ background: "rgba(14,16,16,0.85)" }}
    >
      {btn("H1", editor.isActive("heading", { level: 1 }), () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      )}
      {btn("H2", editor.isActive("heading", { level: 2 }), () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      )}
      {btn("H3", editor.isActive("heading", { level: 3 }), () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      )}
      <span className="mx-1 h-4 w-px bg-[rgba(16,185,129,0.07)]" />
      {btn("B", editor.isActive("bold"), () =>
        editor.chain().focus().toggleBold().run()
      )}
      {btn("I", editor.isActive("italic"), () =>
        editor.chain().focus().toggleItalic().run()
      )}
      {btn("`", editor.isActive("code"), () =>
        editor.chain().focus().toggleCode().run()
      )}
      <span className="mx-1 h-4 w-px bg-[rgba(16,185,129,0.07)]" />
      {btn("• List", editor.isActive("bulletList"), () =>
        editor.chain().focus().toggleBulletList().run()
      )}
      {btn("1. List", editor.isActive("orderedList"), () =>
        editor.chain().focus().toggleOrderedList().run()
      )}
      {btn("Code block", editor.isActive("codeBlock"), () =>
        editor.chain().focus().toggleCodeBlock().run()
      )}
      {btn("Quote", editor.isActive("blockquote"), () =>
        editor.chain().focus().toggleBlockquote().run()
      )}
      <span className="mx-1 h-4 w-px bg-[rgba(16,185,129,0.07)]" />
      {btn("Image", false, insertImage)}
      {btn("Table", false, () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      )}
    </div>
  );
}
