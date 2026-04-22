"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FolderNode, Note, NoteType } from "@/lib/notesStore";

const TREE_KEY = ["folders", "tree"] as const;

async function fetchTree(): Promise<FolderNode[]> {
  const res = await fetch("/api/folders");
  if (!res.ok) throw new Error("Failed to load folders");
  return res.json();
}

export function useFolderTree() {
  return useQuery({ queryKey: TREE_KEY, queryFn: fetchTree });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; parentId: string | null }) => {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TREE_KEY }),
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      parentId?: string | null;
    }) => {
      const { id, ...patch } = input;
      const res = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TREE_KEY }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TREE_KEY }),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      folderId: string;
      type: NoteType;
      title?: string;
    }): Promise<Note> => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TREE_KEY }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TREE_KEY }),
  });
}
