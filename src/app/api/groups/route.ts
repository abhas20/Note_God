import { prisma } from '@/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

const RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || 'psswrd',
}

const pub = new Redis(RedisConfig)

// Create a new group
export async function POST(req: NextRequest) {
  try {
    const { name, description, creatorId } = await req.json()

    if (!name || !creatorId) {
      return NextResponse.json(
        { message: 'Group name and creator ID are required', success: false },
        { status: 400 },
      )
    }

    // Check if group already exists
    const existingGroup = await prisma.group.findUnique({
      where: { name },
    })

    if (existingGroup) {
      return NextResponse.json(
        { message: 'A group with this name already exists', success: false },
        { status: 400 },
      )
    }

    // Create group and add creator as a member
    const group = await prisma.group.create({
      data: {
        name,
        description,
        creatorId,
        members: {
          connect: { id: creatorId },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    // Publish creation to Redis
    const publishedGroup = {
      ...group,
      _count: {
        members: 1,
      },
    }
    await pub.publish(
      'GROUPS',
      JSON.stringify({ action: 'CREATE', group: publishedGroup }),
    )

    return NextResponse.json({ group, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { message: 'Error in creating group', success: false },
      { status: 500 },
    )
  }
}

// Get all groups or filter by user membership
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'joined' or 'discover'

    let groups

    if (userId) {
      if (type === 'joined') {
        // Fetch groups where user is a member
        groups = await prisma.group.findMany({
          where: {
            members: {
              some: { id: userId },
            },
          },
          include: {
            _count: {
              select: { members: true },
            },
          },
        })
      } else {
        // Fetch groups where user is NOT a member (discover groups)
        groups = await prisma.group.findMany({
          where: {
            NOT: {
              members: {
                some: { id: userId },
              },
            },
          },
          include: {
            _count: {
              select: { members: true },
            },
          },
        })
      }
    } else {
      // Fetch all groups
      groups = await prisma.group.findMany({
        include: {
          _count: {
            select: { members: true },
          },
        },
      })
    }

    return NextResponse.json({ groups, success: true }, { status: 200 })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { message: 'Error fetching groups', success: false },
      { status: 500 },
    )
  }
}

// Delete a group created by the user (only the creator can delete)
export async function DELETE(req: NextRequest) {
  try {
    const { groupId, userId } = await req.json()

    if (!groupId || !userId) {
      return NextResponse.json(
        { message: 'Group ID and User ID are required', success: false },
        { status: 400 },
      )
    }

    // Check if the user is the creator of the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return NextResponse.json(
        { message: 'Group not found', success: false },
        { status: 404 },
      )
    }

    if (group.creatorId !== userId) {
      return NextResponse.json(
        { message: 'Only the creator can delete this group', success: false },
        { status: 403 },
      )
    }

    // Delete the group
    await prisma.group.delete({
      where: { id: groupId },
    })

    // Publish deletion to Redis
    await pub.publish('GROUPS', JSON.stringify({ action: 'DELETE', groupId }))

    return NextResponse.json(
      { message: 'Group deleted successfully', success: true },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { message: 'Error deleting group', success: false },
      { status: 500 },
    )
  }
}
