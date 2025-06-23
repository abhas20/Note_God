
import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
    const {searchParams}=new URL(request.url)
    const userId =searchParams.get("userId") || ""
    const newNoteId =await prisma.notes.findFirst({
        where:{
            authId:userId
        },
        orderBy:{
            createdAt:"desc"
        },
        select:{
            id:true
        }
    })
    return NextResponse.json({
        newNoteId:newNoteId?.id
    })
}