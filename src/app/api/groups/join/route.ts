import { prisma } from '@/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Join a group
export async function POST(req: NextRequest) {
  try {
    const { groupId, userId } = await req.json()

    if (!groupId || !userId) {
      return NextResponse.json(
        { message: 'Group ID and User ID are required', success: false },
        { status: 400 },
      )
    }

    // Update the group members
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    })

    return NextResponse.json(
      { group: updatedGroup, message: 'Joined group successfully', success: true },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json(
      { message: 'Error in joining group', success: false },
      { status: 500 },
    )
  }
}
