import Link from "next/link";
import { listClubs } from "@/lib/store";

export default function ClubsPage() {
  const clubs = listClubs();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clubs</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Pick a club to see its live study rooms.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Home
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="group block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {club.name.charAt(0)}
            </div>
            <h2 className="text-lg font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
              {club.name}
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {club.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
