import { NextRequest, NextResponse } from "next/server";
import { createRoom, getClub, listRoomsForClub } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;
  const club = getClub(clubId);
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
  return NextResponse.json(listRoomsForClub(clubId));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;
  const club = getClub(clubId);
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { name?: unknown; hostName?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name : "";
  const hostName = typeof body?.hostName === "string" ? body.hostName : "";
  if (!name.trim() || !hostName.trim()) {
    return NextResponse.json({ error: "name and hostName are required" }, { status: 400 });
  }

  const room = createRoom({ clubId, name, hostName });
  return NextResponse.json(room, { status: 201 });
}
