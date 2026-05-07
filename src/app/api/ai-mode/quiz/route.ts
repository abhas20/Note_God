import { generateQuizAction } from '@/action/quiz'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { noteIds }: { noteIds: string[] } = await req.json()
    const resp = await generateQuizAction(noteIds)

    return NextResponse.json(resp)
  } catch (error) {
    console.error('Error in quiz generation:', error)
    return NextResponse.json(
      { errorMessage: 'Failed to generate quiz' },
      { status: 500 },
    )
  }
}
