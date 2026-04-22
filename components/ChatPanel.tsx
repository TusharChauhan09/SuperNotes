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
      <div className="flex items-center justify-between border-b border-[rgba(16,185,129,0.07)] px-4 py-3">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#8a9e94]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: connected ? "#10b981" : "#4a5c54" }}
          />
          Room chat
        </h3>
        <span
          className={
            "text-[11px] " +
            (connected ? "text-emerald-500" : "text-[#4a5c54]")
          }
        >
          {connected ? "Connected" : "Connecting…"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.length === 0 && (
          <p className="text-center text-xs text-[#4a5c54]">No messages yet.</p>
        )}
        {items.map((item) => {
          if (item.type === "sys") {
            return (
              <p
                key={item.data.id}
                className="text-center text-[11px] text-[#4a5c54]"
              >
                {item.data.displayName}{" "}
                {item.data.kind === "joined" ? "joined" : "left"}
              </p>
            );
          }
          const m = item.data;
          const mine = m.userId === userId;
          return (
            <div
              key={m.id}
              className={
                "flex flex-col " + (mine ? "items-end" : "items-start")
              }
            >
              {!mine && (
                <div className="mb-0.5 px-1 text-[10.5px] text-[#4a5c54]">
                  {m.displayName}
                </div>
              )}
              <div
                className="max-w-[85%] wrap-break-word px-3 py-2 text-[13px] leading-relaxed"
                style={
                  mine
                    ? {
                        borderRadius: "12px 12px 3px 12px",
                        background: "#047857",
                        color: "#e6ede9",
                      }
                    : {
                        borderRadius: "12px 12px 12px 3px",
                        background: "#1a1d1c",
                        border: "1px solid rgba(16,185,129,0.07)",
                        color: "#c8d8d2",
                      }
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
        className="border-t border-[rgba(16,185,129,0.07)] p-3"
      >
        <div className="flex items-center gap-2 rounded-lg border border-[rgba(16,185,129,0.14)] bg-[#141616] px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            maxLength={2000}
            className="flex-1 bg-transparent text-[13px] text-[#e6ede9] outline-none placeholder:text-[#4a5c54]"
          />
          <button
            type="submit"
            disabled={!connected || !draft.trim()}
            className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </>
  );
}
