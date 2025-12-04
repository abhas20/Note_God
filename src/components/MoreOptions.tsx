"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LoaderPinwheel } from "lucide-react";
import Link from "next/link";

function MoreOptions() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="more-options-menu"
        className="flex items-center justify-center"
      >
        <LoaderPinwheel
          className={`transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
        />
      </Button>

      {isOpen && (
        <ul
          id="more-options-menu"
          className="bg-secondary max-sm:bg-secondary absolute top-[calc(100%+8px)] right-0 z-50 w-56 space-y-1 rounded border p-3 text-center text-sm shadow-md transition-all duration-300 max-sm:fixed max-sm:inset-x-4 max-sm:top-28 max-sm:w-auto max-sm:space-y-4 max-sm:rounded-lg max-sm:p-4 sm:w-64 md:w-56"
        >
          <Link
            href="/visualise"
            className="block no-underline hover:text-amber-400"
            onClick={handleToggle}
          >
            <li className="cursor-pointer hover:underline">Visualize</li>
          </Link>
          <Link
            href="/chatpdf"
            className="block no-underline hover:text-amber-400"
            onClick={handleToggle}
          >
            <li className="cursor-pointer hover:underline">
              Chat with PDFs
            </li>
          </Link>
          <Link
            href="/chat"
            className="block no-underline hover:text-amber-400"
            onClick={handleToggle}
          >
            <li className="cursor-pointer hover:underline">
              Community Chat
            </li>
          </Link>
        </ul>
      )}
    </div>
  );
}

export default MoreOptions;
