"use client";

import { useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

const SAVE_DEBOUNCE_MS = 2000;

type Scene = {
  elements?: unknown;
  appState?: { viewBackgroundColor?: string };
  files?: unknown;
};

export function CanvasEditor({
  noteId,
  initialContent,
  onSave,
}: {
  noteId: string;
  initialContent: unknown;
  onSave: (content: unknown) => void;
}) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [noteId]);

  const scene = (initialContent ?? {}) as Scene;

  return (
    <div key={noteId} className="h-full min-h-[70vh] w-full">
      <Excalidraw
        initialData={{
          elements: Array.isArray(scene.elements)
            ? (scene.elements as [])
            : [],
          appState: scene.appState ?? { viewBackgroundColor: "#ffffff" },
          scrollToContent: true,
        }}
        onChange={(elements, appState, files) => {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => {
            onSave({
              elements,
              appState: {
                viewBackgroundColor: appState.viewBackgroundColor,
              },
              files,
            });
          }, SAVE_DEBOUNCE_MS);
        }}
      />
    </div>
  );
}
