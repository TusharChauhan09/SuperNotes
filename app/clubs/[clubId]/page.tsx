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
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← All clubs
        </Link>
      </div>

      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {club.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{club.name}</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            {club.description}
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Start a new room</h2>
        <CreateRoomForm clubId={club.id} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Live rooms</h2>
        {rooms.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No rooms yet — start one above.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <Link
                  href={`/clubs/${club.id}/room/${room.id}`}
                  className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-emerald-500 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Hosted by {room.hostName}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
