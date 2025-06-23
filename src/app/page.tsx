import { getUser } from "@/auth/server"
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import { prisma } from "@/db/prisma";


type props={
  searchParams: Promise<{ [key: string]:string | string [] | undefined}>
}

async function Home({searchParams}:props) {
  const user =await getUser();
  const noteIdParam=(await searchParams).noteId

  const notesId=Array.isArray(noteIdParam)?noteIdParam![0]:noteIdParam||"";
  console.log(noteIdParam);

  const note=await prisma.notes.findFirst({
    where:{id:notesId, authId: user?.id}
  })

  return (
    <div className="flex flex-col items-center h-full gap-4">
      <div className="flex justify-end gap-2 w-full">
      <AskAIButton user={user}/>
      <NewNoteButton user={user}/>
      </div>
    <NoteTextInput noteId={notesId} startingNote={note?.note || ""} />
    </div>
  )
}

export default Home