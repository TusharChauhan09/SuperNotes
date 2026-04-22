"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  PreJoin,
  type LocalUserChoices,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ChatPanel } from "./ChatPanel";

type TokenPayload = {
  token: string;
  url: string;
  identity: string;
};

export function RoomClient({
  roomId,
  roomName,
}: {
  roomId: string;
  roomName: string;
}) {
  const [storedName, setStoredName] = useState<string>("");
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [token, setToken] = useState<TokenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("superstudy:displayName");
      if (stored) setStoredName(stored);
    } catch {}
  }, []);

  const onPreJoinSubmit = useCallback(
    async (values: LocalUserChoices) => {
      if (fetching) return;
      const name = values.username.trim();
      if (!name) {
        setError("Please enter a display name");
        return;
      }
      setError(null);
      setFetching(true);
      try {
        sessionStorage.setItem("superstudy:displayName", name);
      } catch {}
      try {
        const res = await fetch(
          `/api/rooms/${roomId}/token?name=${encodeURIComponent(name)}`
        );
        const body = (await res.json().catch(() => ({}))) as {
          token?: string;
          url?: string;
          identity?: string;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(body.error ?? `Token request failed (${res.status})`);
        }
        if (!body.token || !body.url || !body.identity) {
          throw new Error("LiveKit is not fully configured on the server");
        }
        setChoices({ ...values, username: name });
        setToken({ token: body.token, url: body.url, identity: body.identity });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setFetching(false);
      }
    },
    [roomId, fetching]
  );

  const handleLeave = useCallback(() => {
    setToken(null);
    setChoices(null);
  }, []);

  const handleRoomError = useCallback((err: Error) => {
    setError(err.message || "Something went wrong in the room");
    setToken(null);
    setChoices(null);
  }, []);

  if (!token || !choices) {
    return (
      <div
        className="flex flex-1 items-center justify-center bg-neutral-950 p-6"
        data-lk-theme="default"
      >
        <div className="w-full max-w-md">
          <div className="mb-4 text-center text-sm text-neutral-300">
            Join <span className="font-medium text-white">“{roomName}”</span>
          </div>
          {error && (
            <div className="mb-4 rounded-xl border border-red-800/40 bg-red-900/20 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <PreJoin
            defaults={{
              username: storedName,
              videoEnabled: true,
              audioEnabled: true,
            }}
            onSubmit={onPreJoinSubmit}
            onError={(e) => setError(e.message)}
            joinLabel={fetching ? "Connecting…" : "Join room"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 bg-neutral-950" data-lk-theme="default">
        <LiveKitRoom
          key={token.token}
          serverUrl={token.url}
          token={token.token}
          connect
          video={choices.videoEnabled}
          audio={choices.audioEnabled}
          onDisconnected={handleLeave}
          onError={handleRoomError}
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
      <aside className="hidden w-80 shrink-0 border-l border-neutral-200 bg-white md:flex md:flex-col dark:border-neutral-800 dark:bg-neutral-900">
        <ChatPanel
          roomId={roomId}
          userId={token.identity}
          displayName={choices.username}
        />
      </aside>
    </div>
  );
}
