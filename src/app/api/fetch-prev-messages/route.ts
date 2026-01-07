import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await prisma.messages.findMany({
      orderBy: {
        updatedAt: "asc",
      },
      take: 15,
      include: {
        sender: {
          select: {
            email: true,
            imgUrl: true,
            id: true,
          },
        },
      },
    });

    const formatMessages = res.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: msg.sender,
    }));

    return NextResponse.json({ messages: formatMessages }, { status: 200 });
  } catch (error) {
    console.log("Error in fetching messages", error);
    return NextResponse.json(
      { error: "Error in fetching messages" },
      { status: 500 },
    );
  }
}
