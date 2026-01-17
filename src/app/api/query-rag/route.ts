import { getUser } from "@/auth/server";
import { askQuestion } from "@/lib/rag-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }
    const userId = user.id;
    const { question } = await req.json();
    console.log("Received RAG query:", question);
    const answer = await askQuestion(question,userId);
    return NextResponse.json({ answer });
  } catch (error) {
    console.log("Error in RAG query", error);
    return NextResponse.json(
      { message: "Error in RAG query", success: false },
      { status: 500 },
    );
  }
}
