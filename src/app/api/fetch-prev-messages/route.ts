import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    
    try {

        const res=await prisma.messages.findMany({
            orderBy:{
                updatedAt:"desc",
            },
            take:15,
            include:{
                sender:{
                    select:{
                        email:true,
                        imgUrl:true,
                        id:true,
                    }
                }
            }
        })

        const formatMessages=res.map((msg)=>({
            content:msg.content,
            senderId:msg.senderId,
            email:msg.sender.email,
            imgUrl:msg.sender.imgUrl,
            createdAt:msg.createdAt,
            updatedAt:msg.updatedAt
        }))

        return NextResponse.json({messages:formatMessages}, {status:200});
        
        
    } catch (error) {
        console.log("Error in fetching messages",error);
        return NextResponse.json({error:"Error in fetching messages"}, {status:500});
    }
}