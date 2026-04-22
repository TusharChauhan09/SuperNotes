import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-[rgba(16,185,129,0.14)]"
          style={{ background: "#0e1010" }}
        >
          <span className="text-xl font-extrabold tracking-tighter text-emerald-400">
            S
          </span>
        </div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#4a5c54]">
          SuperStudy
        </p>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-[#e6ede9] sm:text-6xl">
          Study together.
        </h1>
        <p className="mb-10 text-base text-[#8a9e94]">
          Live study rooms with video, voice, and chat. Join a club and hop
          into a session.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/clubs"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Enter clubs
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center justify-center rounded-md border border-[rgba(16,185,129,0.14)] bg-[#0e1010] px-5 py-2.5 text-sm font-medium text-[#c8d8d2] transition hover:bg-[#141616] hover:text-[#e6ede9]"
          >
            Open notes
          </Link>
        </div>
      </div>
    </main>
  );
}
