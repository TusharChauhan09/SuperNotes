"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateFolder,
  useFolderTree,
  useUpdateFolder,
} from "@/hooks/useFolderTree";
import { FolderTree } from "./FolderTree";
import type { FolderNode } from "@/lib/notesStore";

type DragData =
  | { kind: "folder"; id: string; parentId: string | null }
  | { kind: "note"; id: string; folderId: string };

export function NotesSidebar() {
  const qc = useQueryClient();
  const { data: tree, isLoading, isError } = useFolderTree();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const rootParentId = useMemo<string | null>(() => {
    if (tree && tree.length > 0) return null;
    return null;
  }, [tree]);

  const onDragEnd = async (evt: DragEndEvent) => {
    const active = evt.active.data.current as DragData | undefined;
    const overId = evt.over?.id;
    if (!active || !overId) return;
    const overFolderId = String(overId);

    if (active.kind === "folder") {
      if (active.id === overFolderId) return;
      if (active.parentId === overFolderId) return;
      updateFolder.mutate({ id: active.id, parentId: overFolderId });
    } else {
      if (active.folderId === overFolderId) return;
      const res = await fetch(`/api/notes/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: overFolderId }),
      });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["folders", "tree"] });
        qc.invalidateQueries({ queryKey: ["note", active.id] });
      }
    }
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-[rgba(16,185,129,0.07)] bg-[#0e1010]">
      <div className="border-b border-[rgba(16,185,129,0.07)] px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4a5c54] transition hover:text-[#8a9e94]"
          >
            Vault
          </Link>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="rounded px-1.5 py-0.5 text-[11px] font-medium text-[#4a5c54] transition hover:bg-[#1a1d1c] hover:text-[#8a9e94]"
          >
            + Folder
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[rgba(16,185,129,0.07)] bg-[#141616] px-2.5 py-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#4a5c54]"
          >
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full bg-transparent text-xs text-[#e6ede9] outline-none placeholder:text-[#4a5c54]"
          />
        </div>
      </div>

      {creating && (
        <form
          className="border-b border-[rgba(16,185,129,0.07)] px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newName.trim();
            if (!name) return;
            createFolder.mutate(
              { name, parentId: rootParentId },
              {
                onSuccess: () => {
                  setNewName("");
                  setCreating(false);
                },
              }
            );
          }}
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => {
              if (!newName.trim()) setCreating(false);
            }}
            placeholder="Folder name"
            className="w-full rounded-md border border-[rgba(16,185,129,0.2)] bg-[#141616] px-2 py-1 text-sm text-[#e6ede9] outline-none placeholder:text-[#4a5c54] focus:border-emerald-600"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-1 py-1.5 text-sm">
        {isLoading && (
          <p className="px-2 py-3 text-xs text-[#4a5c54]">Loading…</p>
        )}
        {isError && (
          <p className="px-2 py-3 text-xs text-red-400">
            Failed to load folders
          </p>
        )}
        {tree && tree.length === 0 && (
          <p className="px-2 py-3 text-xs text-[#4a5c54]">
            No folders yet. Create one above.
          </p>
        )}
        {tree && tree.length > 0 && (
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <FolderTree
              nodes={tree as FolderNode[]}
              depth={0}
              search={search}
            />
          </DndContext>
        )}
      </div>
    </aside>
  );
}
