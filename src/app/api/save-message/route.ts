import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, senderId } = await req.json();

    const message = await prisma.messages.create({
      data: {
        content,
        senderId,
      },
    });

    return NextResponse.json({ message, success: true }, { status: 200 });
  } catch (error) {
    console.log("Error in saving message", error);
    return NextResponse.json(
      { message: "Error in saving message", success: false },
      { status: 500 },
    );
  }
}
