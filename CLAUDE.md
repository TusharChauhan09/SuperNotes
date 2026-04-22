# SuperStudy — CLAUDE.md

Project codename: **SuperStudy**
A collaborative study platform with live rooms, notes, user profiles, and a browser extension.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Better Auth |
| Realtime | Socket.io |
| Video/Audio | LiveKit (WebRTC SFU) |
| Rich text editor | TipTap |
| Canvas editor | Excalidraw |
| File storage | Azure Blob Storage |
| AI refinement | Gemini API (Google GenAI SDK) — use `gemini-2.5-flash` |
| Future mobile | React Native + Expo (iPad/tablet) |
| Future | Browser extension (Chrome MV3) — deferred |

---

## Project Structure

```
superstudy/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (app)/
      layout.tsx                  ← root layout with left sidebar
      dashboard/page.tsx
      clubs/
        page.tsx                  ← discover + joined clubs
        [clubId]/
          page.tsx                ← club home + channels
          room/[roomId]/
            page.tsx              ← live room (video grid + chat)
      notes/
        layout.tsx                ← folder tree sidebar + editor area
        page.tsx                  ← root folder
        [noteId]/page.tsx         ← note editor
      profile/
        [userId]/page.tsx
      settings/
        profile/page.tsx
    api/
      auth/[...all]/route.ts
      auth/extension-token/route.ts
      clubs/
        route.ts                  ← GET /discover, POST /create
        [clubId]/
          route.ts
          join/route.ts
          members/route.ts
      rooms/
        route.ts
        discover/route.ts
        [roomId]/
          route.ts
          token/route.ts          ← LiveKit token
      messages/route.ts
      folders/
        route.ts
        [folderId]/route.ts
      notes/
        route.ts
        [noteId]/route.ts
        sync/route.ts             ← mobile delta sync
      profile/
        [userId]/route.ts
        [userId]/heatmap/route.ts
        [userId]/history/route.ts
      ai/
        refine/route.ts           ← Gemini refinement for notes
  components/
    clubs/
    rooms/
    notes/
    profile/
    ui/                           ← shared primitives
  lib/
    prisma.ts                     ← Prisma client singleton
    auth.ts                       ← Better Auth config
    livekit.ts                    ← LiveKit server helpers
    socket.ts                     ← Socket.io server setup
    gemini.ts                     ← Google GenAI SDK client
    azure.ts                      ← Azure Blob Storage helpers
    utils.ts
  hooks/                          ← custom TanStack Query hooks
  store/                          ← Zustand stores
  types/                          ← shared TypeScript types
  prisma/
    schema.prisma
    migrations/
  server.ts                       ← custom Next.js server (Socket.io)
```

---

## Database Schema (Prisma)

Full schema lives at `prisma/schema.prisma`. Key models:

### User
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  displayName   String
  avatar        String?
  bio           String?
  createdAt     DateTime @default(now())
  lastActiveAt  DateTime @default(now())

  ownedClubs       Club[]            @relation("ClubOwner")
  clubMemberships  ClubMember[]
  hostedRooms      Room[]            @relation("RoomHost")
  roomSessions     RoomParticipant[]
  sentMessages     Message[]
  folders          Folder[]
  notes            Note[]
  activityLogs     ActivityLog[]
  streak           Streak?
  accounts         Account[]         // Better Auth
  sessions         Session[]         // Better Auth
}
```

### Club
```prisma
model Club {
  id          String   @id @default(cuid())
  name        String
  description String?
  avatar      String?
  isPublic    Boolean  @default(true)
  inviteCode  String?  @unique
  createdAt   DateTime @default(now())

  ownerId  String
  owner    User         @relation("ClubOwner", fields: [ownerId], references: [id])
  members  ClubMember[]
  rooms    Room[]
  messages Message[]
}
```

### ClubMember
```prisma
model ClubMember {
  userId   String
  clubId   String
  role     ClubRole @default(MEMBER)
  joinedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  club Club @relation(fields: [clubId], references: [id])

  @@id([userId, clubId])
}

enum ClubRole {
  OWNER
  MODERATOR
  MEMBER
}
```

### Room
```prisma
model Room {
  id            String     @id @default(cuid())
  name          String
  isPublic      Boolean    @default(true)
  privateCode   String?    @unique
  status        RoomStatus @default(ACTIVE)
  livekitRoomId String     @unique
  createdAt     DateTime   @default(now())
  endedAt       DateTime?

  clubId       String
  club         Club              @relation(fields: [clubId], references: [id])
  hostId       String
  host         User              @relation("RoomHost", fields: [hostId], references: [id])
  participants RoomParticipant[]
  messages     Message[]
}

enum RoomStatus {
  ACTIVE
  ENDED
}
```

### RoomParticipant
```prisma
model RoomParticipant {
  id            String    @id @default(cuid())
  joinedAt      DateTime  @default(now())
  leftAt        DateTime?
  totalDuration Int       @default(0) // seconds

  userId String
  roomId String
  user   User   @relation(fields: [userId], references: [id])
  room   Room   @relation(fields: [roomId], references: [id])

  @@unique([userId, roomId])
}
```

### Message
```prisma
model Message {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())

  senderId String
  sender   User    @relation(fields: [senderId], references: [id])
  roomId   String?
  room     Room?   @relation(fields: [roomId], references: [id])
  clubId   String?
  club     Club?   @relation(fields: [clubId], references: [id])
}
```

### Folder
```prisma
model Folder {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  parentId String?
  parent   Folder?  @relation("FolderTree", fields: [parentId], references: [id])
  children Folder[] @relation("FolderTree")

  ownerId String
  owner   User    @relation(fields: [ownerId], references: [id])
  notes   Note[]
}
```

### Note
```prisma
model Note {
  id        String   @id @default(cuid())
  title     String   @default("Untitled")
  type      NoteType @default(TEXT)
  content   Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  folderId String
  folder   Folder @relation(fields: [folderId], references: [id])
  ownerId  String
  owner    User   @relation(fields: [ownerId], references: [id])
}

enum NoteType {
  TEXT
  CANVAS
}
```

### ActivityLog + Streak
```prisma
model ActivityLog {
  id              String   @id @default(cuid())
  date            DateTime @db.Date
  durationMinutes Int      @default(0)

  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@unique([userId, date])
}

model Streak {
  userId         String   @id
  currentStreak  Int      @default(0)
  longestStreak  Int      @default(0)
  lastStudyDate  DateTime?

  user User @relation(fields: [userId], references: [id])
}
```

---

## Feature Breakdown

### 1. Clubs & Study Rooms

**Clubs** are Discord-like groups. Each club has a sidebar entry (left panel), a home page with channels, and can host live rooms.

- Public clubs: discoverable in `/clubs` discovery modal
- Private clubs: join via `inviteCode` only
- Sidebar: all joined clubs shown as icons (like Discord)
- Routes: `/clubs`, `/clubs/[clubId]`, `/clubs/[clubId]/room/[roomId]`

**Rooms** are live video/audio sessions inside a club.

- Uses LiveKit for WebRTC (SFU model — scales beyond peer-to-peer)
- Host creates room → LiveKit room provisioned server-side → participants get tokens
- Public rooms: listed in a global discovery window
- Private rooms: join via `privateCode` only
- Host controls: mute participant, remove participant, end room
- Track state (cam/mic on/off) managed via LiveKit data messages
- Chat: Socket.io namespace `room:[roomId]`, messages persisted to DB
- On join: `RoomParticipant` row created; on leave: `leftAt` + `totalDuration` computed
- On leave: upsert `ActivityLog` for that day

### 2. User Profiles

Route: `/profile/[userId]`

**Heatmap:**
- Source: `ActivityLog` rows for past 365 days
- Render: 52×7 CSS grid
- Color intensity tiers: `bg-emerald-100` → `bg-emerald-300` → `bg-emerald-600` → `bg-emerald-900`
- Hover tooltip (Framer Motion): date + minutes studied

**Streak:**
- On login / on room leave: check `lastStudyDate` vs today
  - Yesterday → increment `currentStreak`, update `lastStudyDate`
  - Today → no change
  - Older → reset `currentStreak` to 1
- Update `longestStreak` if `currentStreak` exceeds it
- Display: flame icon + current streak count + longest streak badge

**Room History:**
- `RoomParticipant` joined with `Room` + `Club` for the user
- Shows: room name, club name, date joined, time spent
- Infinite scroll via TanStack Query `useInfiniteQuery`

### 3. Notes

Routes: `/notes`, `/notes/[noteId]`

**Layout:**
- Left panel: recursive folder tree (collapse/expand, Framer Motion)
- Right panel: editor (TipTap or Excalidraw depending on note type)

**Folder tree:**
- Self-referencing `Folder` model (parentId)
- Operations: create folder, create subfolder, rename, delete, drag-and-drop reorder
- Drag-and-drop: `@dnd-kit/core`
- Right-click context menu for all folder/note operations

**Text notes (TipTap):**
- Extensions: Bold, Italic, Heading (H1–H3), BulletList, OrderedList, CodeBlock, Table, Image upload, Slash commands (`/`)
- Auto-save: debounced 1000ms on `onUpdate`, PATCH to `/api/notes/[id]`
- Status indicator: "Saved" / "Saving..."

**Canvas notes (Excalidraw):**
- Embedded `<Excalidraw>` component
- Scene JSON persisted on `onChange` (debounced 2000ms)
- Supports: freehand, shapes, arrows, text, sticky notes, images

### 4. AI Refinement (In-App)

Inside the note editor, a "Refine with AI" button runs the current note content through Gemini to produce structured study notes.

- POST `/api/ai/refine` → Gemini API (`gemini-2.5-flash`)
- Input: raw note content (text or selection)
- Output: structured markdown — headings, bullets, code blocks
- UI: side-by-side diff (raw vs refined) → user accepts or discards

### 5. React Native App (Future Phase)

- Expo + React Native targeting iPadOS and Android tablets
- Connects to the same REST API and Socket.io server
- Offline-first: local SQLite cache via `expo-sqlite`
- Sync strategy: delta pull on app open via `/api/notes/sync?since=<timestamp>`
- On edit: write locally, queue sync, push when online
- Conflict resolution: `updatedAt` timestamp comparison (last-write-wins)

---

## API Routes Reference

```
POST /api/auth/register
GET|POST /api/auth/[...all]

GET  /api/clubs/discover           ?search=&page=
POST /api/clubs
GET  /api/clubs/[clubId]
POST /api/clubs/[clubId]/join      body: { code? }
GET  /api/clubs/[clubId]/members

POST /api/rooms                    body: { name, clubId, isPublic, privateCode? }
GET  /api/rooms/discover
GET  /api/rooms/[roomId]/token     → LiveKit participant token
PATCH /api/rooms/[roomId]          body: { status: 'ENDED' }

GET  /api/messages                 ?roomId=|clubId=&cursor=&limit=
POST /api/messages

GET  /api/folders                  → full tree for authed user
POST /api/folders                  body: { name, parentId? }
PATCH /api/folders/[folderId]      body: { name?, parentId? }
DELETE /api/folders/[folderId]

GET  /api/notes/[noteId]
POST /api/notes                    body: { title, type, folderId }
PATCH /api/notes/[noteId]          body: { title?, content? }
DELETE /api/notes/[noteId]
GET  /api/notes/sync               ?since=<ISO timestamp>

GET  /api/profile/[userId]
GET  /api/profile/[userId]/heatmap ?days=365
GET  /api/profile/[userId]/history ?cursor=&limit=

POST /api/ai/refine                body: { rawContent, context? }
```

---

## Real-time Architecture

### Socket.io Namespaces
- `/club/[clubId]` — club-level presence + channel messages
- `/room/[roomId]` — room chat messages + participant events

### Events
```
client → server:
  message:send      { content, roomId | clubId }
  room:join         { roomId }
  room:leave        { roomId }

server → client:
  message:new       { message object }
  room:participant:joined  { userId, displayName }
  room:participant:left    { userId }
  room:ended
```

Socket.io runs on a custom Next.js server (`server.ts`), not in API routes.

---

## LiveKit Integration

- Server: LiveKit Cloud or self-hosted via Docker
- Env vars: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_WS_URL`
- Token generation: `livekit-server-sdk` in `/api/rooms/[roomId]/token`
- Frontend: `@livekit/components-react` for video grid UI
- Host control: server-side API calls to LiveKit REST to mute/remove participants

---

## Gemini API Usage (Note Refinement)

File: `lib/gemini.ts`. Use `gemini-2.5-flash` — best latency/quality tradeoff for short study-note refinement.

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT =
  "You are a study assistant. Restructure the user's raw notes into clear, concise study notes in markdown. " +
  "Use headings, bullet points, and code blocks where appropriate. Preserve all factual content; do not invent new information.";

export async function refineNotes(rawContent: string, context?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
    },
    contents: context
      ? `Context: ${context}\n\nRaw notes:\n${rawContent}`
      : `Raw notes:\n${rawContent}`,
  });
  return response.text;
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# OAuth providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# LiveKit
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_WS_URL=wss://...

# Gemini API
GEMINI_API_KEY=

# File storage (Azure Blob Storage)
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER_NAME=
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (custom server for Socket.io)
npm run dev

# Prisma
npx prisma generate
npx prisma migrate dev --name <name>
npx prisma studio

# Type check
npx tsc --noEmit
```

---

## Coding Conventions

- All files in TypeScript strict mode — no `any` unless absolutely unavoidable
- API route handlers: validate input at the boundary, return typed JSON responses
- All DB queries go through Prisma client from `lib/prisma.ts` (singleton)
- TanStack Query: one custom hook per resource in `hooks/` (e.g., `useClub`, `useNotes`)
- Zustand: one store per domain in `store/` (e.g., `roomStore.ts`, `notesStore.ts`)
- Framer Motion: use `AnimatePresence` for mount/unmount, `layout` prop for list reorders
- Tailwind: use `cn()` utility (clsx + tailwind-merge) for conditional classes
- No `console.log` in committed code — use server-side logging only in catch blocks
- Server components by default; add `"use client"` only when needed (interactivity, hooks)

---

## Development Phases

| Phase | Features | Status |
|---|---|---|
| 1 | Schema, auth, club CRUD, basic chat | Not started |
| 2 | LiveKit rooms, host controls, session tracking | Not started |
| 3 | Notes (TipTap + Excalidraw), folder tree | Not started |
| 4 | User profiles, heatmap, streak, room history | Not started |
| 5 | AI note refinement (Gemini), polish, animations | Not started |
| 6 | React Native mobile app | Future |
| 7 | Browser extension (Chrome MV3) | Future |

---

## Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| WebRTC | LiveKit SFU | Scales beyond P2P; built-in host controls |
| Real-time chat | Socket.io | Flexible namespaces/rooms; works with custom Next.js server |
| Rich text | TipTap | Headless, extensible, JSON output |
| Canvas | Excalidraw | Open source, full-featured, JSON serializable |
| AI | Gemini API (gemini-2.5-flash) | Fast, capable, generous free tier |
| Drag-and-drop | @dnd-kit | Accessible, works with Next.js SSR |
