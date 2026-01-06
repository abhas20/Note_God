"use client";

import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState } from "react";

interface ComunityChatProps {
  handleSendMessage: (message: string) => void;
  isLoading?: boolean;
}

function ComunityChat({ handleSendMessage,isLoading }: ComunityChatProps) {
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleClick = () => {
    if (!message.trim()) return;
    try {
      isLoading = true;
      handleSendMessage(message);
      setMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(""); 
    }
    finally {
      isLoading = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex flex-col space-y-4 gap-y-5 rounded-lg p-4 shadow-md shadow-green-300">
      <Textarea
        placeholder="Type your message here..."
        className="mb-0 w-full rounded border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={message}
        disabled={isLoading}
        rows={3}
      />
      <Button
        variant={"secondary"}
        onClick={handleClick}
        disabled={!message.trim() || isLoading}
        className="hover:bg-secondary-foreground hover:text-secondary border border-gray-300 p-3"
      >
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </div>
  );
}

export default ComunityChat;
