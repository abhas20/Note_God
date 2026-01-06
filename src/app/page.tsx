import { getUser } from "@/auth/server"
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import EditorSkeleton from "@/components/Skeletons/EditorSkeleton";
import Typewriter from "@/components/Typewriter";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";


type props={
  searchParams: { [key: string]:string | string [] | undefined} //removed
  // | Promise<{ [key: string]:string | string [] | undefined}> 
}

async function Home({searchParams}:props) {
  const user =await getUser();

  if(!user){
    redirect("/login")
  }
  // const noteIdParam=searchParams.noteId
  const noteIdParam=(await searchParams).noteId
  let notesId = Array.isArray(noteIdParam)
    ? noteIdParam![0]
    : noteIdParam || "";
  console.log(noteIdParam);

  if(!notesId){
    const latestNote=await prisma.notes.findFirst({
      where:{authId:user?.id},
      orderBy:{createdAt:"desc"}
    })
    if(latestNote){
      redirect(`/?noteId=${latestNote.id}`)
    }

    const newNote=await prisma.notes.create({
      data:{
        authId:user?.id,
        note:"",
      }
    });

    redirect(`/?noteId=${newNote.id}`)
  }
  

  

  const note=await prisma.notes.findFirst({
    where:{id:notesId, authId: user?.id}
  })

  const messages=[
    "Welcome to Note God!",
    "Your personal note-taking assistant.",
    "Type your notes below and let the AI assist you.",
    "Click 'Ask AI' to get insights on your notes.",
    "Use 'New Note' to create a fresh note.",
    "Happy note-taking! 😊"
  ]

  return (
    <div className="flex flex-col items-center h-full gap-4">
      <div style={{ fontSize: '24px', fontFamily: 'monospace' }}>
      <Typewriter texts={messages} />
    </div>
      <div className="flex justify-end gap-2 w-full">
      <AskAIButton user={user}/>
      <NewNoteButton user={user}/>
      </div>
    <Suspense fallback={<EditorSkeleton/>}>
      <NoteTextInput noteId={notesId} startingNote={note?.note || ""} />
    </Suspense>
    </div>
  )
}

export default Home