export default function NotesIndexPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-12 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[rgba(16,185,129,0.1)] bg-[#0e1010] text-xl text-emerald-400">
          ✎
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#e6ede9]">
          Pick a note or start a new one
        </h1>
        <p className="text-sm text-[#8a9e94]">
          Folders in the sidebar hold your notes. Right-click or use the menu
          to create, rename, and delete. Text notes edit with rich formatting;
          canvas notes sketch freehand.
        </p>
      </div>
    </div>
  );
}
