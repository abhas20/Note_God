"use client"

import { getCurrentUser } from '@/action/user';
import ComunityChat from '@/components/ComunityChat'
import { useSocket } from '@/hooks/useSocket';
import { User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react'

function ComunityPage() {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await getCurrentUser();
        if (!("currUser" in res) || !res.currUser) {
          console.error("User not found");
          return;
        }
        console.log(res);
        setUser(res.currUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { sendMessage, messages } = useSocket();
  const [prevMessages, setPrevMessages] = useState(messages);

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch("/api/fetch-prev-messages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch previous messages");
        return;
      }

      const data = await response.json();
      setPrevMessages(data.messages);
      // console.log(data.messages)
    });
  }, []);

  const handleSentMessage = (msg: string) => {
    console.log(msg, user?.id, user?.email, user?.imgUrl);
    if (!user?.id.trim()) {
      console.error("User not found, cannot send message.");
      return;
    }
    sendMessage(msg, user.id, user.email, user.imgUrl || null);
  };

  const allMessages = [...prevMessages, ...messages];

  return (
    <div>
      <h1 className="gap-4 text-center text-2xl">Community Chat</h1>
      <div>
        {isPending || isLoading ? (
          <Loader2 className="mx-auto mt-10 animate-spin" size={32} />
        ) : (
          <div className="mb-4">
            <ul className="space-y-2 gap-2 rounded-lg border p-4 bg-blend-normal max-h-2vh overflow-y-auto custom-scrollbar">
              {allMessages.map((msg, index) => {
                const isCurrentUser = msg.senderId === user?.id;

                return (
                  <li
                    key={index}
                    className={`flex items-start ${isCurrentUser ? "justify-start" : "justify-end"} `}
                  >
                    <div
                      className={`max-w-[55%] min-w-[30%] rounded p-2 ${
                        isCurrentUser
                          ? "bg-card border border-amber-200 text-left"
                          : "border border-amber-300 text-right bg-blend-saturation"
                      }`}
                    >
                      <div className="mb-1 flex items-center space-x-2">
                        {msg.imgUrl && (
                          <img
                            src={msg.imgUrl}
                            alt="User Avatar"
                            className="h-8 w-8 rounded-full"
                          />
                        )}

                        <span className="text-muted-foreground hidden text-sm font-bold md:inline">
                          {isCurrentUser ? "You :" : `${msg.email} :`}
                        </span>
                      </div>

                      <p className="break-words">{msg.content}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <ComunityChat handleSendMessage={handleSentMessage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ComunityPage
