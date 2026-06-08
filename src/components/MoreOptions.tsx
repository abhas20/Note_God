'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Compass, Eye, FileText, MessageSquare, Award } from 'lucide-react'
import Link from 'next/link'

function MoreOptions() {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="more-options-menu"
        className="flex items-center justify-center gap-2 border-indigo-200 bg-indigo-50/30 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-400"
      >
        <Compass
          className={`h-4 w-4 transition-transform duration-350 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        />
        <span className="text-xs font-bold sm:text-sm">Explore Features</span>
      </Button>

      {isOpen && (
        <ul
          id="more-options-menu"
          className="bg-popover border-border absolute top-[calc(100%+8px)] right-0 z-50 w-56 space-y-1 rounded-xl border p-2 text-left text-sm shadow-xl transition-all duration-300 max-sm:fixed max-sm:inset-x-4 max-sm:top-28 max-sm:w-auto max-sm:space-y-3 max-sm:p-4 sm:w-64 md:w-56"
        >
          <li className="list-none">
            <Link
              href="/visualise"
              className="text-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"
              onClick={handleToggle}
            >
              <Eye className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Visualize Notes</span>
            </Link>
          </li>
          <li className="list-none">
            <Link
              href="/chatpdf"
              className="text-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"
              onClick={handleToggle}
            >
              <FileText className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Chat with PDFs</span>
            </Link>
          </li>
          <li className="list-none">
            <Link
              href="/chat"
              className="text-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"
              onClick={handleToggle}
            >
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Community Chat</span>
            </Link>
          </li>
          <li className="list-none">
            <Link
              href="/quiz-mode"
              className="text-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"
              onClick={handleToggle}
            >
              <Award className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Practice Quiz</span>
            </Link>
          </li>
        </ul>
      )}
    </div>
  )
}

export default MoreOptions
