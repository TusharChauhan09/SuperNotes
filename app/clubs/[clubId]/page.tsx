import Link from "next/link";
import { notFound } from "next/navigation";
import { getClub, listRoomsForClub } from "@/lib/store";
import { CreateRoomForm } from "@/components/CreateRoomForm";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const club = getClub(clubId);
  if (!club) notFound();

  const rooms = listRoomsForClub(clubId);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/clubs"
          className="text-sm text-[#4a5c54] transition hover:text-[#c8d8d2]"
        >
          ← All clubs
        </Link>
      </div>

      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[rgba(16,185,129,0.1)] bg-[#0e1010] text-xl font-bold text-emerald-400">
          {club.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e6ede9]">
            {club.name}
          </h1>
          <p className="mt-1 text-[#8a9e94]">{club.description}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4a5c54]">
          Start a new room
        </h2>
        <CreateRoomForm clubId={club.id} />
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4a5c54]">
          Live rooms
        </h2>
        {rooms.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[rgba(16,185,129,0.1)] bg-[#0e1010] p-8 text-center text-sm text-[#4a5c54]">
            No rooms yet — start one above.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <Link
                  href={`/clubs/${club.id}/room/${room.id}`}
                  className="block rounded-lg border border-[rgba(16,185,129,0.07)] bg-[#0e1010] p-4 transition hover:border-[rgba(16,185,129,0.18)] hover:bg-[#141616]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#e6ede9]">
                        {room.name}
                      </p>
                      <p className="mt-1 text-[11px] text-[#4a5c54]">
                        Hosted by {room.hostName}
                      </p>
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
