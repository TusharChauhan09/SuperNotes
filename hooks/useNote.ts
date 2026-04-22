"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/lib/notesStore";

export const noteKey = (id: string) => ["note", id] as const;

async function fetchNote(id: string): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`);
  if (!res.ok) throw new Error("Failed to load note");
  return res.json();
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKey(id),
    queryFn: () => fetchNote(id),
    enabled: !!id,
  });
}

export function useUpdateNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: {
      title?: string;
      content?: unknown;
      folderId?: string;
    }): Promise<Note> => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: (note) => {
      qc.setQueryData(noteKey(id), note);
      qc.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
}
