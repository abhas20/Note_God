"use client";

import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import React, { useEffect, useRef, useState } from "react";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/action/note";
import NoteGenerator from "./NoteGenerator";
import NoteGeneratorScrap from "./NoteGeneratorScrap";

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

  const onSaveNote = (note: string) => {
    updateNoteAction(noteId, note);
  };

  if (noteIdParam !== noteId) return null;

  return (
    <>
      <h1 className="text-2xl font-bold">Hey take your notes:</h1>
      <Textarea
        value={noteText}
        onChange={handleUpdateNote}
        placeholder="Type your note here..."
        className="placeholder:text-muted-foreground mb-4 h-100 max-w-4xl resize-none border bg-transparent p-4 font-mono text-lg text-gray-800 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-200 focus-visible:outline-none md:text-xl md:leading-8 lg:text-xl lg:leading-10 dark:text-gray-200"
      />

      <div className="my-6 flex w-full items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        <span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <NoteGenerator onGenerated={setNoteText} onSaveNote={onSaveNote} />
        <NoteGeneratorScrap />
      </div>
    </>
  );
}
