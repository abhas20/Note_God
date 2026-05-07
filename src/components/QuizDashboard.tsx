'use client'

import { useState } from 'react'
import { Notes } from '@prisma/client'
import QuizGenerator, { QuizHistoryItem } from './QuizGenerator'
import QuizHistory from './QuizHistory'


type View =
  | { type: 'history' }
  | { type: 'generate' }
  | { type: 'retake'; quiz: QuizHistoryItem }

interface QuizDashboardProps {
  notes: Notes[]
  initialHistory: QuizHistoryItem[]
}

export default function QuizDashboard({
  notes,
  initialHistory,
}: QuizDashboardProps) {
  const [view, setView] = useState<View>({ type: 'history' })

  // ─── Generate new quiz ─────────────────────────────────────────────────────
  if (view.type === 'generate') {
    return (
      <QuizGenerator
        notes={notes}
        onBack={() => setView({ type: 'history' })}
      />
    )
  }

  // ─── Retake saved quiz ─────────────────────────────────────────────────────
  if (view.type === 'retake') {
    return (
      <QuizGenerator
        notes={notes}
        initialQuiz={view.quiz}
        onBack={() => setView({ type: 'history' })}
      />
    )
  }

  // ─── Default: history ──────────────────────────────────────────────────────
  return (
    <QuizHistory
      history={initialHistory}
      onGenerateNew={() => setView({ type: 'generate' })}
      onRetake={(quiz) => setView({ type: 'retake', quiz })}
    />
  )
}