'use client'

import React, { useState, useEffect, useTransition, useCallback } from 'react'
import {
  getShortNotesAction,
  createShortNoteAction,
  deleteShortNoteAction,
  updateShortNoteAction,
} from '@/action/shortNote'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import {
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Loader2,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type ShortNote = {
  id: string
  content: string
  noteId: string
  createdAt: Date
  updatedAt: Date
}

type Props = {
  noteId: string
}

export default function ShortNotesPanel({ noteId }: Props) {
  const [shortNotes, setShortNotes] = useState<ShortNote[]>([])
  const [loading, setLoading] = useState(true)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Fetch short notes when noteId changes
  const loadShortNotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getShortNotesAction(noteId)
      if (res.errorMessage) {
        toast.error(res.errorMessage)
      } else {
        // Convert database response dates back to Date objects
        const notesWithDates = (res.shortNotes || []).map((sn: any) => ({
          ...sn,
          createdAt: new Date(sn.createdAt),
          updatedAt: new Date(sn.updatedAt),
        }))
        setShortNotes(notesWithDates)
      }
    } catch (err) {
      toast.error('Failed to load short notes/comments.')
    } finally {
      setLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    if (noteId) {
      loadShortNotes()
    }
  }, [noteId, loadShortNotes])

  // Custom Event Listener to refresh list from other components like AskAI
  useEffect(() => {
    const handleRefresh = () => {
      loadShortNotes()
    }
    window.addEventListener('refresh-short-notes', handleRefresh)
    return () => {
      window.removeEventListener('refresh-short-notes', handleRefresh)
    }
  }, [loadShortNotes])

  // Create short note
  const handleAddShortNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    const contentToAdd = newContent
    setNewContent('')

    startTransition(async () => {
      try {
        const res = await createShortNoteAction(noteId, contentToAdd)
        if (res.errorMessage !== null) {
          toast.error(res.errorMessage)
        } else {
          const sn = res.shortNote
          setShortNotes((prev) => [
            ...prev,
            {
              id: sn.id,
              content: sn.content,
              noteId: sn.noteId,
              createdAt: new Date(sn.createdAt),
              updatedAt: new Date(sn.updatedAt),
            },
          ])
          toast.success('Short note saved!')
        }
      } catch (err) {
        toast.error('Failed to save short note.')
      }
    })
  }

  // Delete short note
  const handleDeleteShortNote = async (id: string) => {
    const originalNotes = [...shortNotes]
    setShortNotes((prev) => prev.filter((sn) => sn.id !== id))

    try {
      const res = await deleteShortNoteAction(id)
      if (res.errorMessage) {
        toast.error(res.errorMessage)
        setShortNotes(originalNotes)
      } else {
        toast.success('Short note deleted!')
      }
    } catch (err) {
      toast.error('Failed to delete short note.')
      setShortNotes(originalNotes)
    }
  }

  // Update short note
  const handleUpdateShortNote = async (id: string) => {
    if (!editContent.trim()) return

    setShortNotes((prev) =>
      prev.map((sn) => (sn.id === id ? { ...sn, content: editContent } : sn)),
    )
    setEditingId(null)

    try {
      const res = await updateShortNoteAction(id, editContent)
      if (res.errorMessage) {
        toast.error(res.errorMessage)
        // Refresh to revert
        const fresh = await getShortNotesAction(noteId)
        if (!fresh.errorMessage) {
          setShortNotes(
            fresh.shortNotes.map((sn) => ({
              ...sn,
              createdAt: new Date(sn.createdAt),
              updatedAt: new Date(sn.updatedAt),
            })),
          )
        }
      } else {
        toast.success('Short note updated!')
      }
    } catch (err) {
      toast.error('Failed to update short note.')
    }
  }

  const startEditing = (sn: ShortNote) => {
    setEditingId(sn.id)
    setEditContent(sn.content)
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/40">
      <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-bold">Short Notes & Comments</h2>
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {shortNotes.length}
        </span>
      </div>

      {/* Short notes scroll list */}
      <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : shortNotes.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center text-gray-400">
            <MessageSquare className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm italic">No short notes yet.</p>
            <p className="text-xs">
              Add one below or save AskAI responses here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {shortNotes.map((sn) => (
                <motion.div
                  key={sn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800"
                >
                  {editingId === sn.id ? (
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 px-2 py-1 text-xs"
                        >
                          <X className="mr-1 h-3 w-3" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateShortNote(sn.id)}
                          className="h-8 px-2 py-1 text-xs"
                        >
                          <Check className="mr-1 h-3 w-3" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleExpand(sn.id)}
                      >
                        <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                          {sn.content.length > 120 && !expandedIds[sn.id]
                            ? `${sn.content.slice(0, 115)}...`
                            : sn.content}
                        </p>
                        {sn.content.length > 120 && (
                          <span className="mt-1 block text-[11px] font-semibold text-indigo-500 hover:text-indigo-600">
                            {expandedIds[sn.id] ? 'Show Less' : 'Show More'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                          {sn.createdAt.toLocaleDateString()} at{' '}
                          {sn.createdAt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => startEditing(sn)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-500 dark:hover:bg-gray-700"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteShortNote(sn.id)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add new short note form */}
      <form onSubmit={handleAddShortNote} className="mt-4 flex flex-col gap-2">
        <Textarea
          placeholder="Add a comment or quick note..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="min-h-[70px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAddShortNote(e)
            }
          }}
        />
        <Button
          type="submit"
          disabled={isPending || !newContent.trim()}
          size="sm"
          className="flex w-full items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Short Note
        </Button>
      </form>
    </div>
  )
}
