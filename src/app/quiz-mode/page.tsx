import { getUser } from '@/auth/server'
import QuizGenerator from '@/components/QuizGenerator'
import { prisma } from '@/db/prisma'
import { Notes } from '@prisma/client'
import { BookOpen, LogIn } from 'lucide-react'
import Link from 'next/link'

const QuizPage = async () => {
  const user = await getUser()
  let notes: Notes[] = []

  if (user) {
    notes = await prisma.notes.findMany({
      where: { authId: user.id },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="max-w-sm space-y-5 text-center">
          <div className="bg-primary/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
            <BookOpen className="text-primary h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Quiz Generator</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Test your knowledge with AI-generated quizzes based on your
              personal notes. Log in to get started.
            </p>
          </div>
          <Link
            href="/login"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <LogIn className="h-4 w-4" />
            Log in to continue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <QuizGenerator notes={notes} />
    </div>
  )
}

export default QuizPage
