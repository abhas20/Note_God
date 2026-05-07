'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
  Save,
  ArrowLeft,
  History,
} from 'lucide-react'
import { Notes, Prisma } from '@prisma/client'
import { NoteSelector } from './NoteSelecter'
import { toast } from 'sonner'
import {
  generateQuizAction,
  saveQuizAttempt,
  saveQuizResult,
} from '@/action/quiz'
import { useRouter } from 'next/navigation'

type Question = {
  questionText: string
  options: string[]
  correctAnswerIndex: number
  correctAnswer: string
  explanation: string
}

type Quiz = {
  questionTitle: string
  quizId: string | null
  questions: Question[]
}

export type QuizHistoryItem = Prisma.QuizGetPayload<{
  include: { attempts: true; questions: true }
}>

interface QuizGeneratorProps {
  notes: Notes[]
  onBack: () => void
  initialQuiz?: QuizHistoryItem 
}

export default function QuizGenerator({
  notes,
  onBack,
  initialQuiz,
}: QuizGeneratorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isRetakeMode = !!initialQuiz

  const [quiz, setQuiz] = useState<Quiz | null>(
    initialQuiz
      ? {
          questionTitle: initialQuiz.title,
          quizId: initialQuiz.id,
          questions: initialQuiz.questions.map((q) => ({
            questionText: q.questionText,
            options: q.options as string[],
            correctAnswerIndex: q.correctAnswerIndex,
            correctAnswer: q.correctAnswer,
            explanation: q.Explanation,
          })),
        }
      : null,
  )

  const [isLoading, setIsLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [isSavingQuiz, setIsSavingQuiz] = useState(false)
  const [quizSaved, setQuizSaved] = useState(isRetakeMode) // ✅ already saved in retake
  const [attemptSaved, setAttemptSaved] = useState(false)

  const toggleNoteSelection = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    )
  }

  const handleGenerateQuiz = async () => {
    if (selectedNoteIds.length === 0) return
    setIsLoading(true)
    setError(null)
    setQuizSaved(false)
    setAttemptSaved(false)

    try {
      const result = await generateQuizAction(selectedNoteIds)
      if (typeof result === 'string') {
        setError(result)
        return
      }
      setQuiz({
        questionTitle: result.questionTitle,
        quizId: null,
        questions: result.questions,
      })
      setAnswers({})
      setIsSubmitted(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveQuiz = async () => {
    if (!quiz || quizSaved) return
    setIsSavingQuiz(true)
    try {
      const saved = await saveQuizResult({
        title: quiz.questionTitle,
        questions: quiz.questions,
      })
      if (typeof saved === 'string') {
        toast.error(saved)
        return
      }
      setQuiz((prev) => (prev ? { ...prev, quizId: saved.quizId } : prev))
      setQuizSaved(true)
      toast.success('Quiz saved to your history!')
      router.refresh()
    } catch {
      toast.error('Failed to save quiz')
    } finally {
      setIsSavingQuiz(false)
    }
  }

  const handleSelectOption = (questionIndex: number, option: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }))
  }

  const calculateScore = () => {
    if (!quiz) return 0
    return quiz.questions.reduce((score, q, index) => {
      return answers[index] === q.correctAnswer ? score + 1 : score
    }, 0)
  }

  const handleSubmit = () => {
    if (!quiz || !allAnswered) return
    setIsSubmitted(true)
  }

  const handleSaveAttempt = () => {
    if (!quiz || attemptSaved || !quiz.quizId) return
    const score = calculateScore()

    startTransition(async () => {
      try {
        await saveQuizAttempt(quiz.quizId!, score, quiz.questions.length)
        setAttemptSaved(true)
        toast.success(
          `Attempt saved! You scored ${score}/${quiz.questions.length} 🎉`,
        )
        router.refresh()
      } catch {
        toast.error('Failed to save attempt')
      }
    })
  }

  const allAnswered = quiz
    ? Object.keys(answers).length === quiz.questions.length
    : false
  const score = calculateScore()

  // ─── Note selection / generation screen ───────────────────────────────────
  if (!quiz) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-lg border p-6 shadow-sm">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>

          <div className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Configure Your Quiz</h2>
            <p className="text-muted-foreground text-sm">
              Select the notes you want the AI Tutor to test you on today.
            </p>
          </div>

          <div className="py-2">
            <h3 className="mb-3 text-sm font-semibold">Your Notes</h3>
            <NoteSelector
              notes={notes}
              selectedNoteIds={selectedNoteIds}
              onToggleNote={toggleNoteSelection}
            />
          </div>

          {error && (
            <p className="text-destructive text-center text-sm">{error}</p>
          )}

          <Button
            onClick={handleGenerateQuiz}
            disabled={isLoading || selectedNoteIds.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Crafting your questions...
              </>
            ) : (
              `Generate Quiz from ${selectedNoteIds.length} Note${selectedNoteIds.length === 1 ? '' : 's'}`
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Quiz taking / results screen ─────────────────────────────────────────
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-lg border p-6 shadow-sm">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="shrink-0 gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              History
            </Button>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">
                {quiz.questionTitle}
              </h2>
              {isRetakeMode && (
                <p className="text-muted-foreground text-xs">Retake</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="bg-muted rounded px-2 py-1 text-sm font-medium">
              {quiz.questions.length} Qs
            </span>
            {!quizSaved ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveQuiz}
                disabled={isSavingQuiz}
                className="gap-1.5"
              >
                {isSavingQuiz ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Quiz
              </Button>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {isRetakeMode ? 'Saved quiz' : 'Quiz saved'}
              </span>
            )}
          </div>
        </div>

        {/* Nudge banner — only for new unsaved quizzes */}
        {!quizSaved && !isRetakeMode && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            💾 Save this quiz to your history so you can retake it and track
            scores over time.
          </div>
        )}

        {/* Questions */}
        {quiz.questions.map((q, index) => {
          const selectedAnswer = answers[index]
          const isCorrect = selectedAnswer === q.correctAnswer

          return (
            <div
              key={index}
              className="bg-card space-y-4 rounded-lg border p-5"
            >
              <h3 className="text-lg font-medium">
                {index + 1}. {q.questionText}
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {q.options.map((option) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectOption = q.correctAnswer === option

                  let buttonVariant:
                    | 'outline'
                    | 'default'
                    | 'destructive'
                    | 'secondary' = 'outline'
                  if (isSubmitted) {
                    if (isCorrectOption) buttonVariant = 'default'
                    else if (isSelected && !isCorrectOption)
                      buttonVariant = 'destructive'
                  } else if (isSelected) {
                    buttonVariant = 'secondary'
                  }

                  return (
                    <Button
                      key={option}
                      variant={buttonVariant}
                      className={`h-auto justify-start px-4 py-3 text-left font-normal whitespace-normal ${
                        buttonVariant === 'secondary'
                          ? 'bg-primary/10 border-2 border-yellow-500'
                          : ''
                      }`}
                      onClick={() => handleSelectOption(index, option)}
                    >
                      {option}
                      {isSubmitted && isCorrectOption && (
                        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isCorrectOption && (
                        <XCircle className="ml-auto h-4 w-4 shrink-0" />
                      )}
                    </Button>
                  )
                })}
              </div>

              {isSubmitted && (
                <div
                  className={`mt-4 rounded-md border p-4 text-sm ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                      : 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
                  }`}
                >
                  <strong className="mb-1 block">Explanation:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          )
        })}

        {/* Footer */}
        <div className="border-t pt-6">
          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full"
              size="lg"
            >
              Submit Answers ({Object.keys(answers).length}/
              {quiz.questions.length} answered)
            </Button>
          ) : (
            <div className="w-full space-y-4">
              {/* Score card */}
              <div className="bg-primary/10 border-primary/20 rounded-lg border p-6 text-center">
                <h3 className="text-2xl font-bold">
                  You scored {score} out of {quiz.questions.length}!
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {score === quiz.questions.length
                    ? '🎉 Perfect score! Note God would be proud.'
                    : score >= quiz.questions.length / 2
                      ? '👍 Good effort! Review the explanations above.'
                      : "📚 Keep studying — you'll get there!"}
                </p>
              </div>

              {/* Save attempt */}
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Save this attempt?</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {quiz.quizId
                        ? 'Track your progress and see improvement over time.'
                        : 'Save the quiz first (top right) to enable attempt tracking.'}
                    </p>
                  </div>
                  {!attemptSaved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveAttempt}
                      disabled={isPending || !quiz.quizId}
                      className="shrink-0 gap-1.5"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <History className="h-3.5 w-3.5" />
                      )}
                      Save Attempt
                    </Button>
                  ) : (
                    <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      Attempt saved
                    </span>
                  )}
                </div>

                {!quiz.quizId && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full gap-1.5"
                    onClick={handleSaveQuiz}
                    disabled={isSavingQuiz}
                  >
                    {isSavingQuiz ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Quiz to Enable Attempt Tracking
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <div className="grid grid-cols-2 gap-3">
                {!isRetakeMode ? (
                  <Button
                    onClick={() => {
                      setQuiz(null)
                      setAnswers({})
                      setIsSubmitted(false)
                      setQuizSaved(false)
                      setAttemptSaved(false)
                    }}
                    variant="outline"
                    size="lg"
                  >
                    New Quiz
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" onClick={onBack}>
                    Back
                  </Button>
                )}
                <Button onClick={onBack} size="lg">
                  View History
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
