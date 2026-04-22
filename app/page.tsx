import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-600">
          SuperStudy
        </p>
        <h1 className="mb-6 text-5xl font-semibold tracking-tight sm:text-6xl">
          Study together.
        </h1>
        <p className="mb-10 text-lg text-neutral-600 dark:text-neutral-300">
          Live study rooms with video, voice, and chat. Join a club and hop
          into a session.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/clubs"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-medium text-white transition hover:bg-emerald-700"
          >
            Enter clubs
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-800 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:text-emerald-300"
          >
            Open notes
          </Link>
        </div>
      </div>
    </main>
  );
}
