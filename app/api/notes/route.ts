import { NextRequest, NextResponse } from "next/server";
import { createNote, type NoteType } from "@/lib/notesStore";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { title?: unknown; type?: unknown; folderId?: unknown }
    | null;
  const folderId = typeof body?.folderId === "string" ? body.folderId : "";
  const rawType = typeof body?.type === "string" ? body.type : "TEXT";
  const type: NoteType = rawType === "CANVAS" ? "CANVAS" : "TEXT";
  const title = typeof body?.title === "string" ? body.title : undefined;

  if (!folderId) {
    return NextResponse.json({ error: "folderId is required" }, { status: 400 });
  }
  try {
    const note = createNote({ title, type, folderId });
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
