import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, webpack: true });
const handle = app.getRequestHandler();

type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: number;
};

const roomMessages = new Map<string, ChatMessage[]>();
const MAX_MESSAGES_PER_ROOM = 200;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    let joinedRoom: string | null = null;
    let userId: string | null = null;
    let displayName: string | null = null;

    socket.on(
      "room:join",
      (payload: { roomId: string; userId: string; displayName: string }) => {
        if (!payload?.roomId || !payload?.userId || !payload?.displayName) return;
        joinedRoom = payload.roomId;
        userId = payload.userId;
        displayName = payload.displayName;
        socket.join(payload.roomId);

        const history = roomMessages.get(payload.roomId) ?? [];
        socket.emit("chat:history", history);

        socket.to(payload.roomId).emit("room:participant:joined", {
          userId,
          displayName,
        });
      }
    );

    socket.on("chat:send", (payload: { content: string }) => {
      if (!joinedRoom || !userId || !displayName) return;
      const text = (payload?.content ?? "").trim();
      if (!text) return;

      const message: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        roomId: joinedRoom,
        userId,
        displayName,
        content: text.slice(0, 2000),
        createdAt: Date.now(),
      };

      const list = roomMessages.get(joinedRoom) ?? [];
      list.push(message);
      if (list.length > MAX_MESSAGES_PER_ROOM) {
        list.splice(0, list.length - MAX_MESSAGES_PER_ROOM);
      }
      roomMessages.set(joinedRoom, list);

      io.to(joinedRoom).emit("chat:new", message);
    });

    socket.on("disconnect", () => {
      if (joinedRoom && userId && displayName) {
        socket.to(joinedRoom).emit("room:participant:left", {
          userId,
          displayName,
        });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(
      `> SuperStudy ready at http://localhost:${port} (${dev ? "dev" : process.env.NODE_ENV})`
    );
  });
});
