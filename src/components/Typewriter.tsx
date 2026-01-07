// components/Typewriter.js
"use client"; // if using in a Next.js 13+ app inside /app directory

import { useState, useEffect } from "react";

type TypewriterProps = {
  texts: string[];
  typingSpeed?: number;
  pauseTime?: number;
  deletingSpeed?: number;
};

const Typewriter = ({
  texts,
  typingSpeed = 150,
  pauseTime = 1500,
  deletingSpeed = 50,
}: TypewriterProps) => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingInterval, setTypingInterval] = useState(typingSpeed);

  useEffect(() => {
    const currentText = texts[loopNum % texts.length];

    const handleTyping = () => {
      setText((prev) => {
        const updatedText = isDeleting
          ? currentText.substring(0, prev.length - 1)
          : currentText.substring(0, prev.length + 1);

        return updatedText;
      });

      if (!isDeleting && text === currentText) {
        setIsDeleting(true);
        setTypingInterval(pauseTime);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
        setTypingInterval(typingSpeed);
      } else {
        setTypingInterval(isDeleting ? deletingSpeed : typingSpeed);
      }
    };

    const timer = setTimeout(handleTyping, typingInterval);

    return () => clearTimeout(timer);
  }, [text, isDeleting]);

  return (
    <span>
      {text}
      <span className="cursor">|</span>
    </span>
  );
};

export default Typewriter;
