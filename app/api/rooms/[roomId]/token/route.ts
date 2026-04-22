import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/store";
import { createParticipantToken } from "@/lib/livekit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = getRoom(roomId);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const url = process.env.LIVEKIT_URL;
  if (!url) {
    return NextResponse.json(
      { error: "LIVEKIT_URL is not configured on the server" },
      { status: 500 }
    );
  }

  const displayName = req.nextUrl.searchParams.get("name")?.trim();
  if (!displayName) {
    return NextResponse.json({ error: "name query param required" }, { status: 400 });
  }

  const identity = `${displayName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    const token = await createParticipantToken({
      roomId: room.id,
      identity,
      name: displayName.slice(0, 40),
    });
    return NextResponse.json({
      token,
      url,
      identity,
    });
  } catch (err) {
    console.error("LiveKit token error", err);
    const message = err instanceof Error ? err.message : "Failed to mint token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
