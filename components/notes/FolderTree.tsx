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
}: {
  nodes: FolderNode[];
  depth: number;
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
}: {
  node: FolderNode;
  depth: number;
  onMenu: (m: MenuState) => void;
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
          "group flex cursor-pointer select-none items-center gap-1 rounded-md px-2 py-1 text-sm text-neutral-800 hover:bg-neutral-200/60 dark:text-neutral-100 dark:hover:bg-neutral-800/60",
          isOver &&
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={cn(
            "inline-block w-3 text-xs text-neutral-400 transition-transform",
            open ? "rotate-90" : ""
          )}
        >
          ▸
        </span>
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
            className="flex-1 rounded border border-emerald-400 bg-white px-1 py-0 text-sm outline-none dark:bg-neutral-900"
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
          className="hidden rounded px-1 text-neutral-400 hover:bg-neutral-300 group-hover:inline dark:hover:bg-neutral-700"
          aria-label="Folder menu"
        >
          ⋯
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (node.children.length > 0 || node.notes.length > 0) && (
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
                />
              ))}
              {node.notes.map((n) => (
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
          "group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60",
          active &&
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
        )}
        style={{ paddingLeft: 8 + depth * 12 + 16 }}
      >
        <span className="w-3 text-xs text-neutral-400">
          {type === "CANVAS" ? "✎" : "▤"}
        </span>
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

  const items: Array<{ label: string; run: () => void }> =
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
                { folderId: menu.id, type: "CANVAS", title: "Untitled canvas" },
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
        className="fixed z-50 min-w-44 rounded-lg border border-neutral-200 bg-white py-1 text-sm shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
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
              className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
