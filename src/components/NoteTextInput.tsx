'use client'

import { useSearchParams } from 'next/navigation'
import { Textarea } from './ui/textarea'
import React, { useEffect, useRef, useState } from 'react'
import useNote from '@/hooks/useNote'
import { updateNoteAction } from '@/action/note'
import NoteGenerator from './NoteGenerator'
import NoteGeneratorScrap from './NoteGenerateScap'
import VisualiseNotes from './VisualiseNotes'
import { Button } from './ui/button'
import { Sparkles, ChevronDown, ChevronUp, Eye, Pen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  noteId: string
  startingNote: string
}

export default function NoteTextInput({ noteId, startingNote }: Props) {
  const noteIdParam = useSearchParams().get('noteId') || ''
  const { noteText, setNoteText } = useNote()
  const updateTime = useRef<NodeJS.Timeout | null>(null)
  const [showVisualiser, setShowVisualiser] = useState(false)

  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNote)
    }
  }, [noteIdParam, noteId, startingNote, setNoteText])

  useEffect(() => {
    return () => {
      if (updateTime.current) {
        clearTimeout(updateTime.current)
      }
    }
  }, [])

  const handleUpdateNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value
    setNoteText(note)

    if (updateTime.current) {
      clearTimeout(updateTime.current)
    }

    updateTime.current = setTimeout(() => {
      updateNoteAction(noteId, note)
    }, 5000)
  }

  const onSaveNote = (note: string) => {
    updateNoteAction(noteId, note)
  }

  if (noteIdParam !== noteId) return null

  return (
    <div className="flex h-full w-full max-w-4xl flex-col">
      {/* Header & Tabs */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hey, take your notes 📝</h1>

        {/* Toggle Buttons */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              mode === 'edit'
                ? 'bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Pen className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              mode === 'preview'
                ? 'bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="bg-background relative h-[60vh] overflow-y-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        {mode === 'edit' ? (
          <Textarea
            value={noteText}
            onChange={handleUpdateNote}
            placeholder="Type your note here..."
            className="h-full min-h-full w-full resize-none border-0 bg-transparent p-6 font-mono text-lg text-gray-800 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl md:leading-8 lg:text-xl lg:leading-10 dark:text-gray-200"
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none p-6">
            {noteText.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings
                  h1: ({ children }) => (
                    <h1 className="mb-2 text-lg font-bold">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-2 text-base font-semibold">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-1 text-sm font-semibold">{children}</h3>
                  ),

                  // Paragraph
                  p: ({ children }) => (
                    <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
                  ),

                  // Bold & italic
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,

                  // Inline code
                  code: ({ children, className }) => {
                    const isBlock = className?.includes('language-')
                    return isBlock ? (
                      <pre className="bg-muted my-2 overflow-x-auto rounded-md p-3 text-xs leading-relaxed">
                        <code>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                        {children}
                      </code>
                    )
                  },

                  // Lists
                  ul: ({ children }) => (
                    <ul className="mb-2 ml-4 list-disc space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 ml-4 list-decimal space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),

                  // Blockquote
                  blockquote: ({ children }) => (
                    <blockquote className="border-muted-foreground/30 my-2 border-l-2 pl-3 italic opacity-80">
                      {children}
                    </blockquote>
                  ),

                  // Horizontal rule
                  hr: () => <hr className="border-muted my-3" />,

                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {children}
                    </a>
                  ),

                  // Tables (from remark-gfm)
                  table: ({ children }) => (
                    <div className="my-2 overflow-x-auto rounded-md border">
                      <table className="w-full text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-muted border-b px-3 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b px-3 py-2 last:border-0">
                      {children}
                    </td>
                  ),
                }}
              >
                {noteText}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>

      {/* Footer / Tools */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <NoteGenerator onGenerated={setNoteText} onSaveNote={onSaveNote} />
          <NoteGeneratorScrap />
        </div>

        {/* Visualiser Toggle */}
        <div>
          <Button
            variant="outline"
            onClick={() => setShowVisualiser((v) => !v)}
            className="flex w-full items-center gap-2"
          >
            <Sparkles className="h-5 w-4 text-indigo-500" />
            {showVisualiser ? 'Hide Visualiser' : 'Visualise Notes'}
            {showVisualiser ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Animated Dropdown */}
        <AnimatePresence>
          {showVisualiser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-lg border p-4">
                <VisualiseNotes noteId={noteId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
