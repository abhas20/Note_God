"use client"

import { User } from "@supabase/supabase-js"
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {v4 as uuidv4} from 'uuid'
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { createNoteAction } from "@/action/note";
type Props={
    user:User| null
}


export default function NewNoteButton({user}:Props) {
  const router=useRouter();
  const [loading,setLoading]=useState(false);

  const handleNewNote=async()=>{
      if(!user){
        router.push("/login")
      }
      else{
        setLoading(true);
        const uuid=uuidv4();
        await createNoteAction(uuid);
        router.push(`/?noteId=${uuid}`)

        toast.success("New Note Created", {
          description: "Successfully created a new note",
          duration:3000
      });
        <Toaster/>
        setLoading(false)
      }
  }

    // console.log(user?.email);
  return (
    <div>
     <Button onClick={handleNewNote} variant="secondary" className="w-24" disabled={loading}>{loading?<Loader2 className="animate-spin"/>: "New Note"}</Button>
    </div>
  )
}
