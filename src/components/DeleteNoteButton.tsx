"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deleteNoteAction } from "@/action/note";



type Prop={
    noteId:string,
    deletenoteLocally:(noteId:string)=>void;
}


export default function DeleteNoteButton({noteId,deletenoteLocally}:Prop) {

  const router=useRouter();
  const noteIdParam=useSearchParams().get("noteId") || ""

  const [isPending,startTransition]=useTransition();
  const handleDeleteNote=()=>{
    startTransition(async()=>{
      const {errorMessage}= await deleteNoteAction(noteId)

      if(!errorMessage){
        toast.success("Deleted",{
          description:"Note Deleted Successfully",
          duration:3000
        })
        deletenoteLocally(noteId);
        if(noteId===noteIdParam) router.replace("/");
      }
      else{
        toast.success("Error",{
          description:errorMessage,
          duration:3000
        })
      }
    })
  }

  return (
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button className="absolute right-2 top-1/2 size-7 -translate-y-1/2 p-0 opacity-0 group-hover/item:opacity-100 [&_svg]:size-3" variant="ghost"><Trash2/></Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure to delete this note?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your note
        and remove your note from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-24">{isPending?<Loader2 className="animate-spin"/>:"DELETE"}</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

  )
}
