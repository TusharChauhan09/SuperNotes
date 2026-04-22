export type NoteType = "TEXT" | "CANVAS";

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt: number;
};

export type Note = {
  id: string;
  title: string;
  type: NoteType;
  content: unknown;
  folderId: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
};

export type FolderNode = Folder & {
  children: FolderNode[];
  notes: Array<Pick<Note, "id" | "title" | "type" | "updatedAt">>;
};

type Store = {
  folders: Folder[];
  notes: Note[];
};

const globalRef = globalThis as unknown as { __superstudyNotesStore?: Store };

const LOCAL_OWNER = "local";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function seed(): Store {
  const rootId = "folder-root";
  const welcomeId = "note-welcome";
  const now = Date.now();
  return {
    folders: [
      {
        id: rootId,
        name: "My notes",
        parentId: null,
        ownerId: LOCAL_OWNER,
        createdAt: now,
      },
    ],
    notes: [
      {
        id: welcomeId,
        title: "Welcome",
        type: "TEXT",
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Welcome to SuperStudy notes" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text:
                    "Create folders in the sidebar, add text or canvas notes, and edits autosave.",
                },
              ],
            },
          ],
        },
        folderId: rootId,
        ownerId: LOCAL_OWNER,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function getStore(): Store {
  if (!globalRef.__superstudyNotesStore) {
    globalRef.__superstudyNotesStore = seed();
  }
  return globalRef.__superstudyNotesStore;
}

function ownerFolders() {
  return getStore().folders.filter((f) => f.ownerId === LOCAL_OWNER);
}

function ownerNotes() {
  return getStore().notes.filter((n) => n.ownerId === LOCAL_OWNER);
}

export function listFolderTree(): FolderNode[] {
  const folders = ownerFolders();
  const notes = ownerNotes();
  const byParent = new Map<string | null, Folder[]>();
  for (const f of folders) {
    const list = byParent.get(f.parentId) ?? [];
    list.push(f);
    byParent.set(f.parentId, list);
  }
  const notesByFolder = new Map<string, Note[]>();
  for (const n of notes) {
    const list = notesByFolder.get(n.folderId) ?? [];
    list.push(n);
    notesByFolder.set(n.folderId, list);
  }

  function build(parentId: string | null): FolderNode[] {
    const kids = (byParent.get(parentId) ?? []).slice().sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return kids.map((f) => ({
      ...f,
      children: build(f.id),
      notes: (notesByFolder.get(f.id) ?? [])
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((n) => ({
          id: n.id,
          title: n.title,
          type: n.type,
          updatedAt: n.updatedAt,
        })),
    }));
  }

  return build(null);
}

export function getFolder(id: string): Folder | undefined {
  return ownerFolders().find((f) => f.id === id);
}

export function createFolder(input: {
  name: string;
  parentId: string | null;
}): Folder {
  const name = input.name.trim().slice(0, 80) || "New folder";
  if (input.parentId && !getFolder(input.parentId)) {
    throw new Error("Parent folder not found");
  }
  const folder: Folder = {
    id: uid("folder"),
    name,
    parentId: input.parentId,
    ownerId: LOCAL_OWNER,
    createdAt: Date.now(),
  };
  getStore().folders.push(folder);
  return folder;
}

export function updateFolder(
  id: string,
  patch: { name?: string; parentId?: string | null }
): Folder {
  const folder = getFolder(id);
  if (!folder) throw new Error("Folder not found");
  if (patch.name !== undefined) {
    folder.name = patch.name.trim().slice(0, 80) || folder.name;
  }
  if (patch.parentId !== undefined) {
    if (patch.parentId === id) throw new Error("Cannot nest folder in itself");
    if (patch.parentId && !getFolder(patch.parentId)) {
      throw new Error("Parent folder not found");
    }
    if (patch.parentId && isDescendant(id, patch.parentId)) {
      throw new Error("Cannot move folder into its own descendant");
    }
    folder.parentId = patch.parentId;
  }
  return folder;
}

function isDescendant(ancestorId: string, maybeDescendantId: string): boolean {
  let cur: string | null = maybeDescendantId;
  const folders = ownerFolders();
  while (cur) {
    if (cur === ancestorId) return true;
    const f: Folder | undefined = folders.find((x) => x.id === cur);
    cur = f?.parentId ?? null;
  }
  return false;
}

export function deleteFolder(id: string): void {
  const folder = getFolder(id);
  if (!folder) throw new Error("Folder not found");
  const store = getStore();
  const toDelete = new Set<string>();
  (function collect(fid: string) {
    toDelete.add(fid);
    for (const child of store.folders.filter((f) => f.parentId === fid)) {
      collect(child.id);
    }
  })(id);
  store.folders = store.folders.filter((f) => !toDelete.has(f.id));
  store.notes = store.notes.filter((n) => !toDelete.has(n.folderId));
}

export function getNote(id: string): Note | undefined {
  return ownerNotes().find((n) => n.id === id);
}

export function createNote(input: {
  title?: string;
  type: NoteType;
  folderId: string;
}): Note {
  if (!getFolder(input.folderId)) throw new Error("Folder not found");
  const now = Date.now();
  const note: Note = {
    id: uid("note"),
    title: (input.title?.trim().slice(0, 120) || "Untitled"),
    type: input.type,
    content: input.type === "TEXT" ? { type: "doc", content: [] } : {},
    folderId: input.folderId,
    ownerId: LOCAL_OWNER,
    createdAt: now,
    updatedAt: now,
  };
  getStore().notes.push(note);
  return note;
}

export function updateNote(
  id: string,
  patch: { title?: string; content?: unknown; folderId?: string }
): Note {
  const note = getNote(id);
  if (!note) throw new Error("Note not found");
  if (patch.title !== undefined) {
    note.title = patch.title.trim().slice(0, 120) || note.title;
  }
  if (patch.content !== undefined) {
    note.content = patch.content;
  }
  if (patch.folderId !== undefined) {
    if (!getFolder(patch.folderId)) throw new Error("Folder not found");
    note.folderId = patch.folderId;
  }
  note.updatedAt = Date.now();
  return note;
}

export function deleteNote(id: string): void {
  const store = getStore();
  const idx = store.notes.findIndex(
    (n) => n.id === id && n.ownerId === LOCAL_OWNER
  );
  if (idx === -1) throw new Error("Note not found");
  store.notes.splice(idx, 1);
}

export function getRootFolderId(): string {
  const roots = ownerFolders().filter((f) => f.parentId === null);
  if (roots.length === 0) {
    const root = createFolder({ name: "My notes", parentId: null });
    return root.id;
  }
  return roots[0].id;
}
