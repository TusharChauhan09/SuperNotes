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

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-end dark:border-neutral-800 dark:bg-neutral-900"
    >
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Room name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Calc study session"
          maxLength={80}
          required
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </label>
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Your name
        </span>
        <input
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="Tushar"
          maxLength={40}
          required
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Start room"}
      </button>
      {error && <p className="text-sm text-red-600 sm:ml-2">{error}</p>}
    </form>
  );
}
