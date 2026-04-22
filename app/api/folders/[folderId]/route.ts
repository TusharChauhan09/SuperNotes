import { NextRequest, NextResponse } from "next/server";
import {
  deleteFolder,
  getFolder,
  updateFolder,
} from "@/lib/notesStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  const folder = getFolder(folderId);
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }
  return NextResponse.json(folder);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  const body = (await req.json().catch(() => null)) as
    | { name?: unknown; parentId?: unknown }
    | null;
  const patch: { name?: string; parentId?: string | null } = {};
  if (typeof body?.name === "string") patch.name = body.name;
  if (typeof body?.parentId === "string" || body?.parentId === null) {
    patch.parentId = body.parentId as string | null;
  }
  try {
    const folder = updateFolder(folderId, patch);
    return NextResponse.json(folder);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    const status = msg === "Folder not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  try {
    deleteFolder(folderId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    const status = msg === "Folder not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
