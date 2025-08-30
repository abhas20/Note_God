"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePollinationsText } from "@pollinations/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

type NoteGeneratorProps = {
  onGenerated: (text: string) => void;
 onSaveNote: (text :string)=> void;
};

export default function NoteGenerator({ onGenerated,onSaveNote }: NoteGeneratorProps) {
  const [noteTopic, setNoteTopic] = useState("");
  const [submittedTopic, setSubmittedTopic] = useState<string>("");
  const [isDisabled,setIsDisabled] = useState<boolean>(false);
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [open,setOpen] =useState<boolean>(false);

  const [generationId, setGenerationId] = useState(0);

  let textGenerated = usePollinationsText(
    submittedTopic,
       {
          model: "mistral",
          seed: 50,
          systemPrompt:
          `You are an AI assistant who can generate notes on a given topic and
          make sure that your answers are not too verbose and you speak succinctly. 
          Your responses MUST be formatted in clean, pointed paragraphs WITHOUT using markdown.`
        }
  );

useEffect(() => {
  if (isLoading && textGenerated !== null) {
    setIsDisabled(false);
    setIsLoading(false); 
    // console.log(textGenerated)
  }
}, [textGenerated]);


  const handleGenerateNote = () => {
    if (!noteTopic.trim() || noteTopic.trim()===submittedTopic) return;
      // setSubmittedTopic(noteTopic.trim());
      setIsDisabled(true);
      setIsLoading(true);
      setGenerationId(prev => prev + 1); // 👈 force re-trigger
      setSubmittedTopic(`${noteTopic.trim()} [${generationId}]`); 

  };


  const handleSaveNote = () => {
    if (!textGenerated || !submittedTopic) return;

    setIsDisabled(true);
    onGenerated(textGenerated);
    onSaveNote(textGenerated);
    setNoteTopic("");
    setOpen(false);
    toast.success("Note saved successfully!",{
      duration: 3000,
      position: "top-right",
    });
  }

  

  const handleOpen=(isOpen:boolean)=>{
      if(isOpen){
        setNoteTopic("");
        setSubmittedTopic("");
        setIsDisabled(false);
      }
      setOpen(isOpen)
    
  }



  return (
    <Dialog onOpenChange={handleOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-center">
          Ask AI to generate Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Notes with AI</DialogTitle>
          <DialogDescription>
            Enter a topic to generate notes. You can save the generated notes
            for later use.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p>Preview: </p>
          <span className="mt-2 block text-sm text-gray-500">
            {isLoading ? "Thinking..." : textGenerated}
          </span>
        </div>

        <div className="mt-auto flex cursor-text flex-col gap-2 rounded-lg border p-4">
          <Input
            placeholder="Write the topic to generate auto notes (example: climate change)"
            value={noteTopic}
            disabled={isDisabled}
            onChange={(e) => setNoteTopic(e.target.value)}
            className="placeholder:text-muted-foreground border-background resize-none rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              minHeight: "0",
              lineHeight: "normal",
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerateNote();
              }
            }}
          />

          <div className="flex items-end justify-end space-x-4 align-middle">
            <Button
              onClick={handleGenerateNote}
              disabled={isDisabled || !noteTopic.trim()}
              className="mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="text-background mr-2" />
                  Generate
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={isDisabled || !textGenerated}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}