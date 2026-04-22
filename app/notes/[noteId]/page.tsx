import { NoteEditor } from "@/components/notes/NoteEditor";

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  return <NoteEditor noteId={noteId} />;
}
