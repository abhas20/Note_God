"use client"

import useNote from "@/hooks/useNote"
import { Notes } from "@prisma/client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarMenuButton } from "./ui/sidebar"
import Link from "next/link"

type Prop={
    note:Notes
}

export default function SelectNoteButton({note}:Prop) {

  const noteId=useSearchParams().get("noteId") || ""
  const {noteText:selectedNoteText} = useNote();
  const [localText,setLocalText]=useState(note.note);
  const [useGlobalState,setuseGlobalState]=useState(false);

  useEffect(()=>{
    if(noteId===note.id){
      setuseGlobalState(true);
    }
    else setuseGlobalState(false);
  },[noteId,note.id])

  useEffect(()=>{
    if(useGlobalState) setLocalText(selectedNoteText);
  },[selectedNoteText,useGlobalState])


  let noteText=localText || "EMPTY NOTE"
  // console.log(note)
  
  if(useGlobalState){
    noteText=selectedNoteText || "EMPTY NOTE"
  }
  return (
      <SidebarMenuButton
      asChild
      className={`items-start gap-0 pr-12 ${note.id === noteId && "bg-sidebar-accent/50"}`}
    >
      <Link href={`/?noteId=${note.id}`} className="flex h-fit flex-col">
        <p className="w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
          {noteText}
        </p>
        <p>{note.updatedAt?.toLocaleDateString()}</p>
      </Link>
      </SidebarMenuButton>
    
  )
}
