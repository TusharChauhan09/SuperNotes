import type { ReactNode } from "react";
import { NotesSidebar } from "@/components/notes/NotesSidebar";

export default function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <NotesSidebar />
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </section>
    </div>
  );
}
