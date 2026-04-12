import { Notes } from '@prisma/client'
import { CheckCircle2, FileText } from 'lucide-react'

interface NoteSelectorProps {
  notes: Notes[]
  selectedNoteIds: string[]
  onToggleNote: (id: string) => void
}

export function NoteSelector({
  notes,
  selectedNoteIds,
  onToggleNote,
}: NoteSelectorProps) {
  if (notes.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm">
        No notes found. Create some notes first!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {notes.map((note) => {
        const isSelected = selectedNoteIds.includes(note.id)

        return (
          <div
            key={note.id}
            onClick={() => onToggleNote(note.id)}
            className={`relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText
                  className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <h4 className="line-clamp-1 text-sm font-medium">
                  {note.note
                    ? note.note.substring(0, 15) + '...'
                    : 'EMPTY NOTE'}
                </h4>
              </div>
              {isSelected && (
                <CheckCircle2 className="text-primary animate-in zoom-in h-4 w-4 duration-200" />
              )}
            </div>
            <p className="text-muted-foreground mt-2 line-clamp-2 truncate overflow-hidden text-xs text-ellipsis whitespace-nowrap">
              {note.note || 'EMPTY NOTE'}
            </p>
            <span className="text-muted-foreground/70 mt-3 block text-[10px]">
              {note.createdAt.toDateString()} {note.createdAt.toTimeString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
