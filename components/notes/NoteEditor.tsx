"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNote, useUpdateNote } from "@/hooks/useNote";
import { TextEditor } from "./TextEditor";

const CanvasEditor = dynamic(
  () => import("./CanvasEditor").then((m) => m.CanvasEditor),
  { ssr: false, loading: () => <div className="p-6 text-sm">Loading canvas…</div> }
);

export function NoteEditor({ noteId }: { noteId: string }) {
  const { data: note, isLoading, isError } = useNote(noteId);
  const update = useUpdateNote(noteId);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedTitle = useRef("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      syncedTitle.current = note.title;
    }
  }, [note?.id, note?.title]);

  const saveTitle = (next: string) => {
    if (titleTimer.current) clearTimeout(titleTimer.current);
    setStatus("saving");
    titleTimer.current = setTimeout(() => {
      if (next.trim() && next !== syncedTitle.current) {
        update.mutate(
          { title: next.trim() },
          {
            onSuccess: (n) => {
              syncedTitle.current = n.title;
              setStatus("saved");
            },
            onError: () => setStatus("idle"),
          }
        );
      } else {
        setStatus("idle");
      }
    }, 600);
  };

  const handleContentSaved = () => {
    setStatus("saved");
  };
  const handleContentSaving = () => {
    setStatus("saving");
  };

  const saveContent = useMemo(() => {
    return (content: unknown) => {
      handleContentSaving();
      update.mutate(
        { content },
        {
          onSuccess: handleContentSaved,
          onError: () => setStatus("idle"),
        }
      );
    };
  }, [update]);

  if (isLoading) {
    return <div className="p-8 text-sm text-neutral-500">Loading…</div>;
  }
  if (isError || !note) {
    return (
      <div className="p-8 text-sm text-red-500">Note not found.</div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            saveTitle(e.target.value);
          }}
          className="flex-1 bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-neutral-400"
          placeholder="Untitled"
        />
        <span className="text-xs text-neutral-500">
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved"
              : ""}
        </span>
      </header>
      <div className="flex-1 min-h-0 overflow-auto">
        {note.type === "TEXT" ? (
          <TextEditor
            noteId={note.id}
            initialContent={note.content}
            onSave={saveContent}
          />
        ) : (
          <CanvasEditor
            noteId={note.id}
            initialContent={note.content}
            onSave={saveContent}
          />
        )}
      </div>
    </div>
  );
}
