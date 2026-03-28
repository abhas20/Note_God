'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { makeNoteAction } from '@/action/note'

type NoteGeneratorProps = {
  onGenerated: (text: string) => void
  onSaveNote: (text: string) => void
}

export default function NoteGenerator({
  onGenerated,
  onSaveNote,
}: NoteGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [noteTopic, setNoteTopic] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [textGenerated, setTextGenerated] = useState('')
  const isDisabled = isLoading

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setNoteTopic('')
      setTextGenerated('')
      setIsLoading(false)
    }
  }

  const handleGenerateNote = async () => {
    try {
      setIsLoading(true)
      setTextGenerated('')
      const response = await makeNoteAction(noteTopic)
      setTextGenerated(response || 'No notes generated.')
      onGenerated(response || '')
    } catch (error) {
      toast.error('An error occurred while generating notes. Please try again.')
      console.error('Error in generating notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNote = () => {
    onSaveNote(textGenerated)
    toast.success('Note saved successfully!')
    handleOpen(false)
  }

  return (
    <Dialog onOpenChange={handleOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-center">
          Ask AI to generate Notes
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[85vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Notes with AI</DialogTitle>
          <DialogDescription>
            Enter a topic to generate notes. You can save the generated notes
            for later use.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Preview Section */}
        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
          <p className="font-medium">Preview:</p>

          <div className="mt-2 text-sm whitespace-pre-wrap text-gray-500">
            {isLoading ? 'Thinking...' : textGenerated}
          </div>
        </div>

        {/* Fixed Bottom Input Section */}
        <div className="bg-background sticky bottom-0 mt-3 flex flex-col gap-2 rounded-lg border p-4">
          <Input
            placeholder="Write the topic to generate auto notes (example: climate change)"
            value={noteTopic}
            disabled={isDisabled}
            onChange={(e) => setNoteTopic(e.target.value)}
            className="placeholder:text-muted-foreground border-background resize-none rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              minHeight: '0',
              lineHeight: 'normal',
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerateNote()
              }
            }}
          />

          <div className="flex items-end justify-end space-x-4">
            <Button
              onClick={handleGenerateNote}
              disabled={isDisabled || !noteTopic.trim()}
              className="mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="text-background mr-2" />
                  Generate
                </>
              )}
            </Button>

            <Button
              onClick={handleSaveNote}
              disabled={isDisabled || !textGenerated}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
