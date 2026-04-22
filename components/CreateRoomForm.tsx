"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateRoomForm({ clubId }: { clubId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !hostName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/clubs/${clubId}/rooms`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, hostName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to create room");
      }
      const room = (await res.json()) as { id: string };
      try {
        sessionStorage.setItem("superstudy:displayName", hostName.trim());
      } catch {}
      router.push(`/clubs/${clubId}/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const inputCls =
    "rounded-md border border-[rgba(16,185,129,0.07)] bg-[#141616] px-3 py-2 text-sm text-[#e6ede9] outline-none placeholder:text-[#4a5c54] transition focus:border-emerald-600";

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-[rgba(16,185,129,0.07)] bg-[#0e1010] p-4 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#4a5c54]">
          Room name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Calc study session"
          maxLength={80}
          required
          className={inputCls}
        />
      </label>
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#4a5c54]">
          Your name
        </span>
        <input
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="Tushar"
          maxLength={40}
          required
          className={inputCls}
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Start room"}
      </button>
      {error && <p className="text-sm text-red-400 sm:ml-2">{error}</p>}
    </form>
  );
}
