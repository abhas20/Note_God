import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(requst:NextRequest) {
    const {searchParams}=new URL(requst.url)
    const userId =searchParams.get("userId") || ""
    const {id} =await prisma.notes.create({
        data:{
            authId:userId,
            note:""
        }
    })
    return NextResponse.json({
        noteId:id
    })
}