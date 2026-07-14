import { prisma } from '@/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const res = await prisma.messages.findMany({
      where: {
        groupId: groupId && groupId !== 'global' ? groupId : null,
      },
      orderBy: {
        updatedAt: 'asc',
      },
      take: 50,
      include: {
        sender: {
          select: {
            email: true,
            imgUrl: true,
            id: true,
          },
        },
      },
    })

    const formatMessages = res.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      groupId: msg.groupId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: msg.sender,
    }))

    return NextResponse.json({ messages: formatMessages }, { status: 200 })
  } catch (error) {
    logger.error({ error }, 'Error in fetching messages')
    return NextResponse.json(
      { error: 'Error in fetching messages' },
      { status: 500 },
    )
  }
}
