import { prisma } from '@/db/prisma'
import Redis from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost', //when not using docker
  // host: process.env.REDIS_HOST || "redis",   //when using docker
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || 'psswrd',
}

const pub = new Redis(RedisConfig)

export async function POST(req: NextRequest) {
  let senderId: string | undefined
  let groupId: string | undefined
  try {
    const body = await req.json()
    senderId = body.senderId
    groupId = body.groupId
    const content = body.content

    if(!senderId || !content) {
      return NextResponse.json(
        { message: 'Missing required fields', success: false },
        { status: 400 },
      )
    }

    const message = await prisma.messages.create({
      data: {
        content,
        senderId,
        groupId: groupId && groupId !== 'global' ? groupId : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            imgUrl: true,
          },
        },
      },
    })
    await pub.publish('MESSAGES', JSON.stringify(message))

    return NextResponse.json({ message, success: true }, { status: 200 })
  } catch (error) {
    logger.error(
      {
        event: 'MESSAGE_SAVE_FAILED',
        senderId,
        groupId: groupId || null,
        error,
      },
      'Error in saving message'
    )
    return NextResponse.json(
      { message: 'Error in saving message', success: false },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  let messageId: string | undefined
  let senderId: string | undefined
  try {
    const body = await request.json()
    messageId = body.messageId
    senderId = body.senderId

    const message = await prisma.messages.findFirst({
      where: {
        id: messageId,
        senderId: senderId,
      },
    })

    if (!message) {
      return NextResponse.json(
        {
          message: 'No message found to delete or unauthorized',
          success: false,
        },
        { status: 404 },
      )
    }

    const groupId = message.groupId

    await prisma.messages.delete({
      where: {
        id: messageId,
      },
    })

    await pub.publish(
      'DELETE_MESSAGES',
      JSON.stringify({ messageId, senderId, groupId }),
    )

    return NextResponse.json(
      { message: 'Message deleted successfully', success: true },
      { status: 200 },
    )
  } catch (error) {
    logger.error(
      {
        event: 'MESSAGE_DELETE_FAILED',
        messageId,
        senderId,
        error,
      },
      'Error in deleting message'
    )
    return NextResponse.json(
      { message: 'Error in deleting message', success: false },
      { status: 500 },
    )
  }
}
