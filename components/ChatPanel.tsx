"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: number;
};

type SystemEvent = {
  id: string;
  kind: "joined" | "left";
  displayName: string;
  at: number;
};

type Item =
  | { type: "msg"; data: ChatMessage }
  | { type: "sys"; data: SystemEvent };

export function ChatPanel({
  roomId,
  userId,
  displayName,
}: {
  roomId: string;
  userId: string;
  displayName: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = io({ path: "/api/socket" });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("room:join", { roomId, userId, displayName });
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("chat:history", (history: ChatMessage[]) => {
      setItems(history.map((m) => ({ type: "msg", data: m })));
    });
    socket.on("chat:new", (msg: ChatMessage) => {
      setItems((prev) => [...prev, { type: "msg", data: msg }]);
    });
    socket.on("room:participant:joined", (p: { displayName: string }) => {
      setItems((prev) => [
        ...prev,
        {
          type: "sys",
          data: {
            id: `j-${Date.now()}-${Math.random()}`,
            kind: "joined",
            displayName: p.displayName,
            at: Date.now(),
          },
        },
      ]);
    });
    socket.on("room:participant:left", (p: { displayName: string }) => {
      setItems((prev) => [
        ...prev,
        {
          type: "sys",
          data: {
            id: `l-${Date.now()}-${Math.random()}`,
            kind: "left",
            displayName: p.displayName,
            at: Date.now(),
          },
        },
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userId, displayName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [items]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("chat:send", { content: text });
    setDraft("");
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h3 className="text-sm font-semibold">Chat</h3>
        <span
          className={
            "inline-flex items-center gap-1.5 text-xs " +
            (connected ? "text-emerald-600" : "text-neutral-400")
          }
        >
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (connected ? "bg-emerald-500" : "bg-neutral-400")
            }
          />
          {connected ? "Connected" : "Connecting…"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.length === 0 && (
          <p className="text-center text-xs text-neutral-400">No messages yet.</p>
        )}
        {items.map((item) => {
          if (item.type === "sys") {
            return (
              <p key={item.data.id} className="text-center text-xs text-neutral-400">
                {item.data.displayName} {item.data.kind === "joined" ? "joined" : "left"}
              </p>
            );
          }
          const m = item.data;
          const mine = m.userId === userId;
          return (
            <div
              key={m.id}
              className={"flex flex-col " + (mine ? "items-end" : "items-start")}
            >
              <div className="mb-0.5 px-1 text-xs text-neutral-500">
                {m.displayName}
              </div>
              <div
                className={
                  "max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm " +
                  (mine
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100")
                }
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={send}
        className="flex gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message"
          maxLength={2000}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={!connected || !draft.trim()}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </>
  );
}
