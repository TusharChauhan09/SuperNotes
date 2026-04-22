import { NextRequest, NextResponse } from "next/server";
import { createFolder, listFolderTree } from "@/lib/notesStore";

export async function GET() {
  return NextResponse.json(listFolderTree());
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { name?: unknown; parentId?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const parentId =
    typeof body?.parentId === "string" || body?.parentId === null
      ? (body.parentId as string | null)
      : null;
  try {
    const folder = createFolder({ name, parentId });
    return NextResponse.json(folder, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
