import Link from "next/link";
import { listClubs } from "@/lib/store";

export default function ClubsPage() {
  const clubs = listClubs();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a5c54]">
            Discover
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#e6ede9]">
            Clubs
          </h1>
          <p className="mt-2 text-[#8a9e94]">
            Pick a club to see its live study rooms.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[#4a5c54] transition hover:text-[#c8d8d2]"
        >
          ← Home
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="group block rounded-lg border border-[rgba(16,185,129,0.07)] bg-[#0e1010] p-5 transition hover:border-[rgba(16,185,129,0.2)] hover:bg-[#141616]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#1a1d1c] text-sm font-bold text-[#8a9e94] group-hover:text-emerald-400">
              {club.name.charAt(0)}
            </div>
            <h2 className="text-[15px] font-semibold text-[#e6ede9] transition group-hover:text-emerald-300">
              {club.name}
            </h2>
            <p className="mt-1 text-[13px] text-[#8a9e94]">{club.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
