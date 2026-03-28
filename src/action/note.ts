'use server'

import { getUser } from '@/auth/server'
import { prisma } from '@/db/prisma'
import { handleError } from '@/lib/utils'
import gemini from '../../ai'

export const updateNoteAction = async (noteId: string, note: string) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to update a note')
    await prisma.notes.update({
      where: { id: noteId },
      data: { note },
    })
    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to create a note')
    await prisma.notes.create({
      data: {
        id: noteId,
        authId: user.id,
        note: '',
      },
    })
    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser()
    if (!user) throw new Error('you must be logged in to delete a note')
    await prisma.notes.delete({
      where: { id: noteId, authId: user.id },
    })
    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}

export const askAINoteAction = async (
  newQuestion: string[],
  response: string[],
  noteId: string,
) => {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to ask ai questios')

  const notesCount = await prisma.notes.count({
    where: { authId: user.id },
  })

  const currNote = await prisma.notes.findFirst({
    where: { id: noteId, authId: user.id },
    select: { note: true, createdAt: true, updatedAt: true },
  })
  if (notesCount === 0 || !currNote) return "You don't have notes yet"

  const formatedNote = `
                Total Available Notes:${notesCount}
                User's Currently Opened Note:${currNote.note}
                Created At:${currNote.createdAt.toDateString()}
                Updated At:${currNote.updatedAt.toDateString()}
                `.trim()

  const contents = []

  for (let i = 0; i < response.length; i++) {
    if (newQuestion[i]) {
      contents.push({
        role: 'user',
        parts: [{ text: newQuestion[i] }],
      })
    }

    contents.push({
      role: 'model',
      parts: [{ text: response[i] }],
    })
  }

  const currentQuestion = newQuestion[newQuestion.length - 1]
  if (currentQuestion) {
    contents.push({
      role: 'user',
      parts: [{ text: currentQuestion }],
    })
  }

  const systemMessage =
    `You are a helpful assistant that answers questions about a user's notes.
                        Assume all questions relate to the user's notes.
                        Be concise and accurate.

                        IMPORTANT:
                        - Respond ONLY in clean, valid HTML.
                        - Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <br>.
                        - Do NOT use markdown.
                        - Do NOT include scripts, styles, or attributes.

                        Here are the user's notes:
                        ${formatedNote}`.trim()

  try {
    const completion = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemMessage,
      },
      contents: contents,
    })

    return completion.text ?? '<p>Sorry, something went wrong.</p>'
  } catch (error) {
    console.warn('AI Response error: ', error)
    return '<p>Sorry, the AI could not generate a response.</p>'
  }
}

export const makeNoteAction = async (topic: string) => {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to make ai notes')

  const systemMessage = `
        You are an expert note-taking assistant.
        Create detailed and organized notes on the given topic.
        Use clear headings, subheadings, bullet points, and numbered lists.
        Ensure accuracy and depth in the content.
        Do NOT use markdown or include scripts, styles, or attributes.
    `.trim()

  try {
    const completion = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemMessage,
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Create comprehensive notes on the topic: ${topic}` },
          ],
        },
      ],
    })

    const aiGeneratedNote =
      completion.text ?? '<p>Sorry, something went wrong.</p>'

    return aiGeneratedNote
  } catch (error) {
    console.warn('Make Note AI error: ', error)
    handleError(error)
    return '<p>Sorry, the AI could not generate the notes.</p>'
  }
}

export async function generateImagePrompt(noteId: string) {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to generate image prompts')

  const currNote = await prisma.notes.findFirst({
    where: { id: noteId, authId: user.id },
    select: { note: true },
  })
  if (!currNote) return "You don't have notes yet"

  const systemMessage = `You are an expert image prompt generator.
     Create a detailed and vivid image prompt based on the user's notes.
     Keep the prompt concise, ideally under 30 words.
     The prompt should be descriptive and suitable for AI image generation models.
     Respond ONLY with the image prompt text, without any additional commentary.
     Here are the user's notes:
     ${currNote.note}`.trim()

  try {
    const completion = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemMessage,
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Generate an image prompt based on my notes.' }],
        },
      ],
    })
    console.log(completion.text)

    return (
      completion.text ?? 'A beautiful landscape with mountains and a river.'
    )
  } catch (error) {
    console.warn('Image Prompt AI error: ', error)
    handleError(error)
    return 'A beautiful landscape with mountains and a river.'
  }
}
