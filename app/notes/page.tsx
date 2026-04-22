export default function NotesIndexPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-12 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="text-2xl">✎</span>
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Pick a note or start a new one
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Folders in the sidebar hold your notes. Right-click or use the menu
          to create, rename, and delete. Text notes edit with rich formatting;
          canvas notes sketch freehand.
        </p>
      </div>
    </div>
  );
}
