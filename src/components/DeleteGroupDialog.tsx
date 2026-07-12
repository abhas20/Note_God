'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface DeleteGroupDialogProps {
  onConfirm: () => void
  isDeleting?: boolean
  groupName: string
}

export function DeleteGroupDialog({
  onConfirm,
  isDeleting,
  groupName,
}: DeleteGroupDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
          title="Delete Group"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 size={16} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Group "{groupName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the group
            and all of its message history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
