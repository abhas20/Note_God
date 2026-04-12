'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Loader2, CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import { Notes } from '@prisma/client'
import { NoteSelector } from './NoteSelecter'
import { toast } from 'sonner'

type Question = {
  questionText: string
  options: string[]
  correctAnswerIndex: number
  correctAnswer: string
  explanation: string
}

type Quiz = {
  questionTitle: string
  questions: Question[]
}

interface QuizGeneratorProps {
  notes: Notes[]
}

export default function QuizGenerator({ notes }: QuizGeneratorProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const toggleNoteSelection = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id)
        ? prev.filter((noteId) => noteId !== id)
        : [...prev, id],
    )
  }

  const handleGenerateQuiz = async () => {
    if (selectedNoteIds.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-mode/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteIds: selectedNoteIds }),
      })

      if (!response.ok) {
        const err = await response.json()
        toast.error(err.errorMessage || 'Failed to generate quiz')
        throw new Error(err.errorMessage ?? 'Failed to generate quiz')
      }

      const data: Quiz = await response.json()
      setQuiz(data)
      setAnswers({})
      setIsSubmitted(false)
    } catch (err) {
      console.error('Failed to fetch quiz', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
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

  const allAnswered = quiz
    ? Object.keys(answers).length === quiz.questions.length
    : false

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-lg border p-6 shadow-sm">
      {!quiz ? (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Configure Your Quiz</h2>
            <p className="text-muted-foreground text-sm">
              Select the notes you want the AI Tutor to test you on today.
            </p>
          </div>

          <div className="py-4">
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
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold">{quiz.questionTitle}</h2>
            <span className="bg-muted rounded px-2 py-1 text-sm font-medium">
              {quiz.questions.length} Questions
            </span>
          </div>

          {quiz.questions.map((q, index) => {
            const selectedAnswer = answers[index]
            // const isAnswered = selectedAnswer !== undefined

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
                    const isCorrect = q.correctAnswer === option

                    let buttonVariant:
                      | 'outline'
                      | 'default'
                      | 'destructive'
                      | 'secondary' = 'outline'
                    if (isSubmitted) {
                      if (isCorrect) buttonVariant = 'default'
                      else if (isSelected && !isCorrect)
                        buttonVariant = 'destructive'
                    } else if (isSelected) {
                      buttonVariant = 'secondary'
                    }

                    return (
                      <Button
                        key={option}
                        variant={buttonVariant}
                        className={`h-auto justify-start px-4 py-3 text-left font-normal whitespace-normal ${buttonVariant === 'secondary' ? 'bg-primary/10 border-2 border-yellow-500' : ''}`}
                        onClick={() => handleSelectOption(index, option)}
                      >
                        {option}
                        {isSubmitted && isCorrect && (
                          <CheckCircle2 className="ml-auto h-4 w-4 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle className="ml-auto h-4 w-4 shrink-0" />
                        )}
                      </Button>
                    )
                  })}
                </div>

                {isSubmitted && (
                  <div
                    className={`mt-4 rounded-md border p-4 text-sm ${
                      selectedAnswer === q.correctAnswer
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

          <div className="flex items-center justify-between border-t pt-6">
            {!isSubmitted ? (
              <Button
                onClick={() => setIsSubmitted(true)}
                disabled={!allAnswered}
                className="w-full"
                size="lg"
              >
                Submit Answers ({Object.keys(answers).length}/
                {quiz.questions.length} answered)
              </Button>
            ) : (
              <div className="w-full space-y-4">
                <div className="bg-primary/10 border-primary/20 rounded-lg border p-6 text-center">
                  <h3 className="text-2xl font-bold">
                    You scored {calculateScore()} out of {quiz.questions.length}
                    !
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {calculateScore() === quiz.questions.length
                      ? 'Perfect score! Note God would be proud.'
                      : 'Review the explanations above to solidify your knowledge.'}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setQuiz(null)
                    setAnswers({})
                    setIsSubmitted(false)
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Return to Notes Selection
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
