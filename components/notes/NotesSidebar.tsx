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
    <aside className="flex w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Notes
        </Link>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
        >
          + Folder
        </button>
      </div>

      {creating && (
        <form
          className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800"
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
            className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 text-sm">
        {isLoading && (
          <p className="px-2 py-3 text-xs text-neutral-500">Loading…</p>
        )}
        {isError && (
          <p className="px-2 py-3 text-xs text-red-500">
            Failed to load folders
          </p>
        )}
        {tree && tree.length === 0 && (
          <p className="px-2 py-3 text-xs text-neutral-500">
            No folders yet. Create one above.
          </p>
        )}
        {tree && tree.length > 0 && (
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <FolderTree nodes={tree as FolderNode[]} depth={0} />
          </DndContext>
        )}
      </div>
    </aside>
  );
}
