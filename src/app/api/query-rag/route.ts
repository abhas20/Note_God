import { askQuestion } from "@/lib/rag-utils";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest) {
    try {
        const {question} = await req.json();
        console.log("Received RAG query:", question);
        const answer = await askQuestion(question);
        return NextResponse.json({ answer });
        
    } 
    catch (error) {
        console.log("Error in RAG query",error);
        return NextResponse.json({message:"Error in RAG query",success:false},{status:500});
    }
}