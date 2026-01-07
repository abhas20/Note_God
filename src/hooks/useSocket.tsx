"use client";
import { SocketContext } from "@/providers/SocketProvider";
import { useContext } from "react";

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state)
    throw new Error("useSocket should be used within the SocketProvider");

  return state;
};
