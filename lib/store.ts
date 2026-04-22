export type Club = {
  id: string;
  name: string;
  description: string;
};

export type Room = {
  id: string;
  clubId: string;
  name: string;
  hostName: string;
  createdAt: number;
};

type Store = {
  clubs: Club[];
  rooms: Room[];
};

const globalRef = globalThis as unknown as { __superstudyStore?: Store };

function seed(): Store {
  return {
    clubs: [
      {
        id: "general",
        name: "General",
        description: "The main study club. Hop into a room to start a session.",
      },
      {
        id: "math",
        name: "Math",
        description: "Calculus, linear algebra, problem-solving sessions.",
      },
      {
        id: "cs",
        name: "Computer Science",
        description: "Coding sessions, algorithms, system design study.",
      },
    ],
    rooms: [
      {
        id: "lobby",
        clubId: "general",
        name: "Lobby",
        hostName: "SuperStudy",
        createdAt: Date.now(),
      },
    ],
  };
}

export function getStore(): Store {
  if (!globalRef.__superstudyStore) {
    globalRef.__superstudyStore = seed();
  }
  return globalRef.__superstudyStore;
}

export function listClubs(): Club[] {
  return getStore().clubs;
}

export function getClub(clubId: string): Club | undefined {
  return getStore().clubs.find((c) => c.id === clubId);
}

export function listRoomsForClub(clubId: string): Room[] {
  return getStore()
    .rooms.filter((r) => r.clubId === clubId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getRoom(roomId: string): Room | undefined {
  return getStore().rooms.find((r) => r.id === roomId);
}

export function createRoom(input: {
  clubId: string;
  name: string;
  hostName: string;
}): Room {
  const id = `${input.clubId}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const room: Room = {
    id,
    clubId: input.clubId,
    name: input.name.trim().slice(0, 80) || "Untitled room",
    hostName: input.hostName.trim().slice(0, 40) || "Host",
    createdAt: Date.now(),
  };
  getStore().rooms.push(room);
  return room;
}
