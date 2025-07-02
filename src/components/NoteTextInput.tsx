"use client"

import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import React, { useEffect, useRef } from "react";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/action/note";


type Props = {
  noteId: string;
  startingNote: string;
};

export default function NoteTextInput({ noteId, startingNote }: Props) {
  const noteIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote();
  const updateTime = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNote);
    }
  }, [noteIdParam, noteId, startingNote, setNoteText]);

  useEffect(() => {
    return () => {
      if (updateTime.current) {
        clearTimeout(updateTime.current);
      }
    };
  }, []);

  const handleUpdateNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value;
    setNoteText(note);

    if (updateTime.current) {
      clearTimeout(updateTime.current);
    }

    updateTime.current = setTimeout(() => {
      updateNoteAction(noteId, note);
    }, 5000);
  };

  if (noteIdParam !== noteId) return null;

  return (
    <>
    <h1 className="text-2xl">Hey take your notes:</h1>
    <Textarea
      value={noteText}
      onChange={handleUpdateNote}
      placeholder="Type your note here..."
      className="mb-4 max-w-4xl resize-none border p-4 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 h-100 focus-visible:ring-blue-500 focus-visible:ring-offset-blue-200 focus-visible:border-blue-500 focus-visible:outline-none text-lg md:text-xl lg:text-xl md:leading-8 lg:leading-10 font-mono bg-transparent text-gray-800 dark:text-gray-200"
      />
      </>
  );
}

