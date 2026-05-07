'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import {
  BookOpen,
  Clock,
  PlusCircle,
  RotateCcw,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Attempt, Prisma, Quiz } from '@prisma/client'
import { deleteQuiz } from '@/action/quiz'

type QuizHistoryItem = Prisma.QuizGetPayload<{
    include: { attempts: true, questions: true }
    
}>

interface QuizHistoryProps {
  history: QuizHistoryItem[]
  onGenerateNew: () => void
  onRetake: (quiz: QuizHistoryItem) => void
}

export default function QuizHistory({
  history,
  onGenerateNew,
  onRetake,
}: QuizHistoryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      await deleteQuiz(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  const getBestScore = (attempts: Attempt[]) => {
    if (attempts.length === 0) return null
    return Math.max(...attempts.map((a) => a.score))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz History</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {history.length === 0
              ? 'No quizzes yet — generate your first one!'
              : `${history.length} quiz${history.length === 1 ? '' : 'zes'} saved`}
          </p>
        </div>
        <Button onClick={onGenerateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Quiz
        </Button>
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-14 text-center">
          <BookOpen className="text-muted-foreground mb-4 h-10 w-10" />
          <h3 className="text-lg font-semibold">No quizzes yet</h3>
          <p className="text-muted-foreground mt-1 mb-5 max-w-xs text-sm">
            Generate a quiz from your notes and your results will appear here.
          </p>
          <Button onClick={onGenerateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate First Quiz
          </Button>
        </div>
      )}

      {/* Quiz cards */}
      <div className="space-y-4">
        {history.map((quiz) => {
          const bestScore = getBestScore(quiz.attempts)
          const totalQuestions = quiz.questions.length
          const percentage =
            bestScore !== null
              ? Math.round((bestScore / totalQuestions) * 100)
              : null

          const scoreColor =
            percentage === null
              ? ''
              : percentage >= 80
                ? 'text-green-600 dark:text-green-400'
                : percentage >= 50
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'

          const barColor =
            percentage === null
              ? ''
              : percentage >= 80
                ? 'bg-green-500'
                : percentage >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'

          return (
            <div
              key={quiz.id}
              className="bg-card rounded-lg border p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: info */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">
                    {quiz.title}
                  </h3>

                  <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span>{totalQuestions} questions</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(quiz.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {quiz.attempts.length} attempt
                      {quiz.attempts.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Score section */}
                  {bestScore !== null ? (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Best: {bestScore}/{totalQuestions}
                        </span>
                        <span className={`font-semibold ${scoreColor}`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-2.5 text-xs italic">
                      Not attempted yet
                    </p>
                  )}
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetake(quiz)}
                    className="gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retake
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(quiz.id)}
                    disabled={isPending && deletingId === quiz.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
