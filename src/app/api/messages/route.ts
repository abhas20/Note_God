import { prisma } from "@/db/prisma";
import Redis from "ioredis";
import { NextRequest, NextResponse } from "next/server";

const RedisConfig = {
  host: process.env.REDIS_HOST || "localhost", //when not using docker
  // host: process.env.REDIS_HOST || "redis",   //when using docker
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || "psswrd",
};

const pub = new Redis(RedisConfig);

export async function POST(req: NextRequest) {
  try {
    const { content, senderId } = await req.json();

    const message = await prisma.messages.create({
      data: {
        content,
        senderId,
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
    });
    await pub.publish("MESSAGES", JSON.stringify(message));

    return NextResponse.json({ message, success: true }, { status: 200 });
  } catch (error) {
    console.log("Error in saving message", error);
    return NextResponse.json(
      { message: "Error in saving message", success: false },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { messageId, senderId } = await request.json();

    const deleteResult = await prisma.messages.deleteMany({
      where: {
        id: messageId,
        senderId: senderId,
      },
    });
    if (deleteResult.count === 0) {
      return NextResponse.json(
        {
          message: "No message found to delete or unauthorized",
          success: false,
        },
        { status: 404 },
      );
    }

    await pub.publish(
      "DELETE_MESSAGES",
      JSON.stringify({ messageId, senderId }),
    );

    return NextResponse.json(
      { message: "Message deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error in deleting message", error);
    return NextResponse.json(
      { message: "Error in deleting message", success: false },
      { status: 500 },
    );
  }
}
