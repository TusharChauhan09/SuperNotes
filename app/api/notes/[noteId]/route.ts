import { NextRequest, NextResponse } from "next/server";
import { deleteNote, getNote, updateNote } from "@/lib/notesStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  const note = getNote(noteId);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json(note);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  const body = (await req.json().catch(() => null)) as
    | { title?: unknown; content?: unknown; folderId?: unknown }
    | null;
  const patch: { title?: string; content?: unknown; folderId?: string } = {};
  if (typeof body?.title === "string") patch.title = body.title;
  if (body && "content" in body && body.content !== undefined) {
    patch.content = body.content;
  }
  if (typeof body?.folderId === "string") patch.folderId = body.folderId;
  try {
    const note = updateNote(noteId, patch);
    return NextResponse.json(note);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    const status = msg === "Note not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  try {
    deleteNote(noteId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    const status = msg === "Note not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
