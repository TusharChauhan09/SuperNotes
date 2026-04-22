"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { FolderNode } from "@/lib/notesStore";
import {
  useCreateFolder,
  useCreateNote,
  useDeleteFolder,
  useDeleteNote,
  useUpdateFolder,
} from "@/hooks/useFolderTree";
import { cn } from "@/lib/utils";

type MenuState =
  | { kind: "folder"; id: string; x: number; y: number }
  | { kind: "note"; id: string; folderId: string; x: number; y: number }
  | null;

export function FolderTree({
  nodes,
  depth,
  search = "",
}: {
  nodes: FolderNode[];
  depth: number;
  search?: string;
}) {
  const [menu, setMenu] = useState<MenuState>(null);

  return (
    <>
      <ul className="space-y-0.5">
        {nodes.map((node) => (
          <FolderRow
            key={node.id}
            node={node}
            depth={depth}
            onMenu={setMenu}
            search={search}
          />
        ))}
      </ul>
      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} />}
    </>
  );
}

function FolderRow({
  node,
  depth,
  onMenu,
  search,
}: {
  node: FolderNode;
  depth: number;
  onMenu: (m: MenuState) => void;
  search: string;
}) {
  const [open, setOpen] = useState(depth === 0);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(node.name);
  const updateFolder = useUpdateFolder();

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: node.id,
    data: { kind: "folder-target", id: node.id },
  });
  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
    id: `folder-${node.id}`,
    data: { kind: "folder", id: node.id, parentId: node.parentId },
  });

  const setRef = (el: HTMLDivElement | null) => {
    setDropRef(el);
    setDragRef(el);
  };

  const visibleNotes = search
    ? node.notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase())
      )
    : node.notes;

  return (
    <li>
      <div
        ref={setRef}
        {...attributes}
        {...listeners}
        onContextMenu={(e) => {
          e.preventDefault();
          onMenu({ kind: "folder", id: node.id, x: e.clientX, y: e.clientY });
        }}
        className={cn(
          "group flex cursor-pointer select-none items-center gap-1.5 rounded px-2 py-[3px] text-[12.5px] text-[#8a9e94] transition hover:bg-[#1a1d1c] hover:text-[#c8d8d2]",
          isOver && "bg-[#1a1d1c] ring-1 ring-[rgba(16,185,129,0.25)]"
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0 text-[#4a5c54] transition-transform",
            open && "rotate-90"
          )}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0",
            open ? "text-emerald-500/70" : "text-[#4a5c54]"
          )}
        >
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
        {renaming ? (
          <input
            autoFocus
            value={name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              const trimmed = name.trim();
              if (trimmed && trimmed !== node.name) {
                updateFolder.mutate({ id: node.id, name: trimmed });
              } else {
                setName(node.name);
              }
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setName(node.name);
                setRenaming(false);
              }
            }}
            className="flex-1 rounded border border-emerald-600/50 bg-[#141616] px-1 py-0 text-sm text-[#e6ede9] outline-none"
          />
        ) : (
          <span
            className="flex-1 truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRenaming(true);
            }}
          >
            {node.name}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenu({
              kind: "folder",
              id: node.id,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          className="hidden rounded px-1 text-[#4a5c54] hover:bg-[#202424] hover:text-[#c8d8d2] group-hover:inline"
          aria-label="Folder menu"
        >
          ⋯
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (node.children.length > 0 || visibleNotes.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <ul className="space-y-0.5">
              {node.children.map((child) => (
                <FolderRow
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onMenu={onMenu}
                  search={search}
                />
              ))}
              {visibleNotes.map((n) => (
                <NoteRow
                  key={n.id}
                  id={n.id}
                  title={n.title}
                  type={n.type}
                  folderId={node.id}
                  depth={depth + 1}
                  onMenu={onMenu}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function NoteRow({
  id,
  title,
  type,
  folderId,
  depth,
  onMenu,
}: {
  id: string;
  title: string;
  type: "TEXT" | "CANVAS";
  folderId: string;
  depth: number;
  onMenu: (m: MenuState) => void;
}) {
  const params = useParams<{ noteId?: string }>();
  const active = params?.noteId === id;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `note-${id}`,
    data: { kind: "note", id, folderId },
  });

  return (
    <li>
      <Link
        href={`/notes/${id}`}
        ref={setNodeRef as unknown as React.Ref<HTMLAnchorElement>}
        {...attributes}
        {...listeners}
        onContextMenu={(e) => {
          e.preventDefault();
          onMenu({ kind: "note", id, folderId, x: e.clientX, y: e.clientY });
        }}
        className={cn(
          "group flex items-center gap-1.5 rounded px-2 py-[3px] text-[12.5px] text-[#8a9e94] transition hover:bg-[#1a1d1c] hover:text-[#c8d8d2]",
          active &&
            "border-l-2 border-emerald-600 bg-[rgba(16,185,129,0.08)] text-emerald-300"
        )}
        style={{ paddingLeft: 8 + depth * 14 + 16 }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0",
            active ? "text-emerald-500" : "text-[#4a5c54]"
          )}
        >
          {type === "CANVAS" ? (
            <path d="M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M3 21l9-9 M12.2 6.2L11 5" />
          ) : (
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" />
          )}
        </svg>
        <span className="flex-1 truncate">{title}</span>
      </Link>
    </li>
  );
}

function ContextMenu({
  menu,
  onClose,
}: {
  menu: NonNullable<MenuState>;
  onClose: () => void;
}) {
  const router = useRouter();
  const createFolder = useCreateFolder();
  const createNote = useCreateNote();
  const deleteFolder = useDeleteFolder();
  const deleteNote = useDeleteNote();

  const items: Array<{ label: string; run: () => void; danger?: boolean }> =
    menu.kind === "folder"
      ? [
          {
            label: "New text note",
            run: () => {
              createNote.mutate(
                { folderId: menu.id, type: "TEXT", title: "Untitled" },
                { onSuccess: (n) => router.push(`/notes/${n.id}`) }
              );
            },
          },
          {
            label: "New canvas note",
            run: () => {
              createNote.mutate(
                {
                  folderId: menu.id,
                  type: "CANVAS",
                  title: "Untitled canvas",
                },
                { onSuccess: (n) => router.push(`/notes/${n.id}`) }
              );
            },
          },
          {
            label: "New subfolder",
            run: () => {
              const name = prompt("Folder name");
              if (name?.trim()) {
                createFolder.mutate({ name: name.trim(), parentId: menu.id });
              }
            },
          },
          {
            label: "Delete folder",
            danger: true,
            run: () => {
              if (confirm("Delete this folder and all its notes?")) {
                deleteFolder.mutate(menu.id);
              }
            },
          },
        ]
      : [
          {
            label: "Delete note",
            danger: true,
            run: () => {
              if (confirm("Delete this note?")) {
                deleteNote.mutate(menu.id);
                router.push("/notes");
              }
            },
          },
        ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <ul
        className="fixed z-50 min-w-44 rounded-lg border border-[rgba(16,185,129,0.14)] bg-[#141616] py-1 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
        style={{ left: menu.x, top: menu.y }}
      >
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => {
                item.run();
                onClose();
              }}
              className={cn(
                "block w-full px-3 py-1.5 text-left transition hover:bg-[#1a1d1c]",
                item.danger
                  ? "text-red-400 hover:text-red-300"
                  : "text-[#e6ede9]"
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
