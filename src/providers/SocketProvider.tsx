"use client";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface Sender {
  id: string;
  email: string;
  imgUrl?: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: Sender;
  createdAt: string;
}

interface ISocketContextType {
  sendMessage: (message: string, senderID: string) => Promise<void>;
  deleteMessage: (messageId: string, senderID: string) => Promise<void>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const SocketContext = createContext<ISocketContextType | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback(async (content: string, senderID: string) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, senderId: senderID }),
      });

      if (!response.ok) throw new Error("Failed to send message");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, []);

  const deleteMessage = useCallback(
    async (messageId: string, senderID: string) => {
      try {
        const response = await fetch("/api/messages", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, senderId: senderID }),
        });

        if (!response.ok) throw new Error("Failed to delete message");
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    },
    [],
  );

  // Receive message from socket
  const onMessageReceived = useCallback((message: Message) => {
    console.log("Real-time message received:", message);

    setMessages((prev) => [...prev, message]);
  }, []);

  const onDeleteReceived = useCallback((payload: { messageId: string }) => {
    console.log("Real-time delete received:", payload);

    setMessages((prev) => prev.filter((msg) => msg.id !== payload.messageId));
  }, []);

  const socketServerUrl =
    process.env.SOCKET_SERVER_URL || "http://localhost:4000";

  useEffect(() => {
    const _socket = io(socketServerUrl, {
      withCredentials: true,
    });
    _socket.on("message", onMessageReceived);
    _socket.on("delete:message", onDeleteReceived);
    setSocket(_socket);

    return () => {
      _socket.off("message", onMessageReceived);
      _socket.off("delete:message", onDeleteReceived);
      console.log("Socket disconnected");
      setSocket(undefined);
      _socket.disconnect();
    };
  }, [onMessageReceived, onDeleteReceived]);

  return (
    <SocketContext.Provider
      value={{ sendMessage, deleteMessage, messages, setMessages }}
    >
      {children}
    </SocketContext.Provider>
  );
};
