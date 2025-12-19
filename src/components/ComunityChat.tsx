"use client";

import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState } from "react";

interface ComunityChatProps {
  handleSendMessage: (message: string) => void;
}

function ComunityChat({ handleSendMessage }: ComunityChatProps) {
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleClick = () => {
    handleSendMessage(message);
    setMessage("");
  };

  return (
    <div className="flex flex-col space-y-4 gap-y-5 rounded-lg p-4 shadow-md shadow-green-300">
      <Textarea
        placeholder="Type your message here..."
        className="mb-0 w-full rounded border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleClick();
          }
        }}
        value={message}
      />
      <Button
        variant={"secondary"}
        onClick={handleClick}
        disabled={!message.trim()}
        className="hover:bg-secondary-foreground hover:text-secondary border border-gray-300 p-3"
      >
        Send
      </Button>
    </div>
  );
}

export default ComunityChat;
