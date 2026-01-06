"use client"

import { getCurrentUser } from '@/action/user';
import CommunityChat from '@/components/ComunityChat'
import { DeleteMessageDialog } from '@/components/DeleteMessageDialog';
import { useSocket } from '@/hooks/useSocket';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner';

function CommunityPage() {

  type CurrentUser = {
    id: string;
    email: string;
    imgUrl: string | null;
  };

  const [user, setUser] = useState<CurrentUser>();
  const [isFetchingUser, setIsFetchingUser] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendMessage, messages, deleteMessage, setMessages } = useSocket();

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        if ("currUser" in res && res.currUser) {
          setUser(res.currUser);
        } else if ("errorMessage" in res) {
          console.error("Error fetching user:", res.errorMessage);
          toast.error(res.errorMessage);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
      finally {
        setIsFetchingUser(false);
      }
    };
    fetchUser();
  }, []);


  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/fetch-prev-messages");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        // console.log(data);
        
        setMessages(data.messages); 

      } catch (error) {
        console.error("Failed to fetch previous messages", error);
        toast.error("Could not load chat history");
      }
    });
  }, [setMessages]);


  const handleSentMessage = async (msg: string) => {
    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    await sendMessage(msg, user.id);
  };

  const handleDeleteMessage = async (messageId: string, senderId: string) => {
    if (!user?.id || senderId !== user.id) {
        toast.error("You can only delete your own messages");
        return;
    }
    try {
      setIsDeleting(true);
      await deleteMessage(messageId, senderId);
      
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
    finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh]"> 
      <h1 className="text-center text-2xl font-bold py-4">Community Chat</h1>
      
      {isFetchingUser || isPending ? (
        <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden p-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 mt-10">No messages yet. Say hello!</p>
                )}
                
                {messages.map((msg, index) => {
                    const isCurrentUser = msg.sender.id === user?.id;
                    const userImage =
                      msg.sender.imgUrl ||
                      "https://th.bing.com/th/id/OIP.8REM5cu_BoBMq5wF85yYAwHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";
                    const userEmail = msg.sender?.email || "Unknown";

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex max-w-[70%] flex-col gap-1 ${isCurrentUser ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`relative rounded-xl px-4 py-2 text-sm shadow-sm ${
                              isCurrentUser
                                ? "rounded-tr-none bg-blue-600 text-white"
                                : "rounded-tl-none bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                            } `}
                          >
                            <div
                              className={`flex items-center gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                            >
                              <img
                                src={userImage}
                                alt="Avatar"
                                className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                              />
                              <span className="text-xs text-card-foreground/70">
                                {isCurrentUser ? "You" : userEmail}
                              </span>
                            </div>
                            <p className="leading-relaxed break-words">
                              {msg.content}
                            </p>

                            {isCurrentUser && (
                              <div className="absolute top-1 -left-8">
                                <DeleteMessageDialog
                                  onConfirm={() =>
                                    handleDeleteMessage(msg.id, msg.senderId)
                                  }
                                  isDeleting={isDeleting}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <div className="mt-4">
                <CommunityChat handleSendMessage={handleSentMessage} />
            </div>
        </div>
      )}
    </div>
  );
}

export default CommunityPage; 