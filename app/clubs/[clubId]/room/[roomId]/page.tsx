import Link from "next/link";
import { notFound } from "next/navigation";
import { getClub, getRoom } from "@/lib/store";
import { RoomClient } from "@/components/RoomClient";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ clubId: string; roomId: string }>;
}) {
  const { clubId, roomId } = await params;
  const club = getClub(clubId);
  const room = getRoom(roomId);
  if (!club || !room || room.clubId !== clubId) notFound();

  return (
    <main className="flex flex-1 flex-col bg-[#080909]">
      <div className="flex h-12 items-center justify-between border-b border-[rgba(16,185,129,0.07)] bg-[#0e1010] px-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/clubs/${clubId}`}
            className="text-sm text-[#4a5c54] transition hover:text-[#c8d8d2]"
          >
            ← {club.name}
          </Link>
          <span className="h-3.5 w-px bg-[rgba(16,185,129,0.1)]" />
          <h1 className="text-sm font-semibold text-[#e6ede9]">{room.name}</h1>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: "rgba(239,68,68,0.12)",
            color: "#f87171",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <span className="h-1 w-1 rounded-full bg-red-400" />
          Live
        </span>
      </div>
      <RoomClient roomId={room.id} roomName={room.name} />
    </main>
  );
}
