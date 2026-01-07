"use client";

import { NoteProviderContext } from "@/providers/NoteProvider";
import { useContext } from "react";

const useNote = () => {
  const context = useContext(NoteProviderContext);
  if (!context)
    throw new Error("use Note Provider should be used within the NoteProvider");

  return context;
};

export default useNote;
