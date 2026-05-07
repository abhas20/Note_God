'use server'

import { getUser } from "@/auth/server"
import { prisma } from "@/db/prisma"
import gemini, { googleAI } from "../../ai"
import { generateText, Output } from "ai"
import z from "zod"
import { handleError } from "@/lib/utils"
import { revalidatePath } from "next/cache"


type QuizQuestion = {
  questionText: string
  options: string[]
  correctAnswerIndex: number
  correctAnswer: string
  explanation: string
}

type Quiz = {
  title: string
  questions: QuizQuestion[]

}

const quizSchema = Output.object({
  schema: z.object({
    questionTitle: z.string().describe('The quiz question'),
    questions: z
      .array(
        z.object({
          questionText: z.string().describe('The quiz question'),
          options: z
            .array(z.string())
            .length(4)
            .describe('The answer options'),
          correctAnswerIndex: z
            .number()
            .describe('The index of the correct answer (0-3)'),
          correctAnswer: z.string().describe('The correct answer text'),
          explanation: z
            .string()
            .describe('An explanation of the correct answer'),
        }),
      )
      .min(3)
      .max(5)
      .describe('A list of quiz questions'),
  }),
})



export async function generateQuizAction(noteId: string[]) {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to generate quizzes')

  const currNote = await prisma.notes.findMany({
    where: { id: { in: noteId }, authId: user.id },
    select: { note: true },
  })

  if (!currNote || currNote.length === 0) return "You don't have notes yet"

  const combinedNotes = currNote.map((n) => n.note).join('\n')
  const sumarizedNotesResponse = await gemini.models.generateContent({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are an expert summarizer.
      Summarize the user's notes into a concise format that captures the key points and main ideas so that any LLM can generate a quiz on important points.
      The summary should be clear and easy to understand, while retaining the essential information from the original notes.
      Respond ONLY with the summary text, without any additional commentary.`,
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: `Generate a compact summary on my notes ${combinedNotes}` },
        ],
      },
    ],
  })
  const sumarizedNotes = sumarizedNotesResponse.text ?? combinedNotes


  try {
    const { output } = await generateText({
      model: googleAI('gemini-2.5-flash'),
      output: quizSchema,
      temperature: 0.7,
      prompt: `You are an expert quiz generator.
            Create a quiz based on the user's notes.
            The quiz should have a clear title and 3-5 questions.
            Each question should have 4 answer options, with one correct answer.
            Provide an explanation for the correct answer.
            Respond ONLY with the quiz data in the specified JSON format, without any additional commentary.
            Here are the user's notes:
            ${sumarizedNotes}`.trim(),
    })

    return { questionTitle: output.questionTitle, questions: output.questions }
  } catch (error) {
    console.warn('Quiz Generation AI error: ', error)
    handleError(error)
    return 'Sorry, the AI could not generate the quiz.'
  }
}


export async function saveQuizResult(quiz:Quiz) {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to save quiz results')

    try {
    const saved_quiz = await prisma.quiz.create({
      data: {
        title: quiz.title,
        authId: user.id,
        questions: {
          create: quiz.questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex,
            correctAnswer: q.correctAnswer,
            Explanation: q.explanation,
          })),
        },
      },
    })

    revalidatePath('/ai-mode/quiz')

    return {quizId: saved_quiz.id, message: 'Quiz saved successfully' }
  }
    catch (error) {
    console.warn('Save Quiz Result error: ', error)
    handleError(error)
    return 'Sorry, there was an error saving your quiz results.'
  }
}

export async function getUserQuizzes() {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to view your quizzes')

  try {
    const quizzes = await prisma.quiz.findMany({
      where: { authId: user.id },
      include: { questions: true,attempts: {orderBy: {createdAt: 'desc'}} },
    })
    return quizzes
  }
  catch (error) {
    console.warn('Get User Quizzes error: ', error)
    handleError(error)
    return 'Sorry, there was an error retrieving your quizzes.'
  }
}

export async function getQuizById(quizId: string) {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to view the quiz')

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, authId: user.id },
      include: { questions: true },
    })
    if (!quiz) throw new Error('Quiz not found')
    return quiz
  }
  catch (error) {
    console.warn('Get Quiz By ID error: ', error)
    handleError(error)
    return 'Sorry, there was an error retrieving the quiz.'
  }
}

export async function saveQuizAttempt(quizId: string, score: number, totalQuestions: number) {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to save quiz attempts')

  try {
    const attempt = await prisma.attempt.create({
      data: {
        quizId,
        userId: user.id,
        score,
        total: totalQuestions,
      },
    })

    revalidatePath('/ai-mode/quiz')
    return attempt
  }
  catch (error) {
    console.warn('Save Quiz Attempt error: ', error)
    handleError(error)
    return 'Sorry, there was an error saving your quiz attempt.'
  }
}


export async function deleteQuiz(quizId: string) {
  const user = await getUser()
  if (!user) throw new Error('you must be logged in to delete a quiz')

  try {
    await prisma.quiz.deleteMany({
      where: { id: quizId, authId: user.id },
    })

    revalidatePath('/ai-mode/quiz')
    return 'Quiz deleted successfully'
  }
  catch (error) {
    console.warn('Delete Quiz error: ', error)
    handleError(error)
    return 'Sorry, there was an error deleting the quiz.'
  }
}