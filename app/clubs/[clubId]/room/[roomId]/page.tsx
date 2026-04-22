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
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/clubs/${clubId}`}
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← {club.name}
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <h1 className="font-medium">{room.name}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
      <RoomClient roomId={room.id} roomName={room.name} />
    </main>
  );
}
