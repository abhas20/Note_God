'use server'

import { getUser } from '@/auth/server'
import { prisma } from '@/db/prisma'
import { handleError } from '@/lib/utils'

export const getShortNotesAction = async (noteId: string) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to get short notes')

    const shortNotes = await prisma.shortNotes.findMany({
      where: {
        noteId,
        note: {
          authId: user.id,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return { shortNotes, errorMessage: null }
  } catch (error) {
    return { shortNotes: [], errorMessage: handleError(error).errorMessage }
  }
}

export const createShortNoteAction = async (
  noteId: string,
  content: string,
) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to create a short note')

    // Verify ownership of the parent note
    const note = await prisma.notes.findFirst({
      where: { id: noteId, authId: user.id },
    })
    if (!note) throw new Error('Note not found or unauthorized')

    const shortNote = await prisma.shortNotes.create({
      data: {
        noteId,
        content: content.trim(),
      },
    })
    return { shortNote, errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}

export const deleteShortNoteAction = async (shortNoteId: string) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to delete a short note')

    // Verify ownership of the parent note through the relationship
    const shortNote = await prisma.shortNotes.findFirst({
      where: {
        id: shortNoteId,
        note: {
          authId: user.id,
        },
      },
    })
    if (!shortNote) throw new Error('Short note not found or unauthorized')

    await prisma.shortNotes.delete({
      where: { id: shortNoteId },
    })
    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}

export const updateShortNoteAction = async (
  shortNoteId: string,
  content: string,
) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to update a short note')

    // Verify ownership
    const shortNote = await prisma.shortNotes.findFirst({
      where: {
        id: shortNoteId,
        note: {
          authId: user.id,
        },
      },
    })
    if (!shortNote) throw new Error('Short note not found or unauthorized')

    await prisma.shortNotes.update({
      where: { id: shortNoteId },
      data: { content: content.trim() },
    })
    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}
