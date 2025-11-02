"use server"

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import openai from "../../openai";

export const updateNoteAction=async(noteId:string,note:string)=>{
    try {
        const user=await getUser();
        if(!user) throw new Error("you must be logged in to update a note");
        await prisma.notes.update({
            where:{id:noteId},
            data:{note},
        });
        return {errorMessage:null}
    } catch (error) {
        return handleError(error);
    }
}

export const createNoteAction=async(noteId:string)=>{
    try {
        const user=await getUser();
        if(!user) throw new Error("you must be logged in to create a note");
        await prisma.notes.create({
            data:{
                id:noteId,
                authId:user.id,
                note:""
            }
            
        })
        return {errorMessage:null}
    } catch (error) {
        return handleError(error);
    }
}

export const deleteNoteAction=async(noteId:string)=>{
    try {
        const user=await getUser();
        if(!user) throw new Error("you must be logged in to delete a note");
        await prisma.notes.delete({
            where:{id:noteId,authId:user.id},
        });
        return {errorMessage:null};
    } catch (error) {
        return handleError(error);
    }
}

export const askAINoteAction=async(newQuestion:string[],response:string[],noteId:string)=>{
 
        const user=await getUser();
        if(!user) throw new Error("you must be logged in to ask ai questios");
        const notes=await prisma.notes.findMany({
            where:{authId:user.id},
            orderBy:{updatedAt:"desc"},
            select:{createdAt:true,updatedAt:true,note:true}
        })
        const currNote=await prisma.notes.findUnique({
            where:{id:noteId,authId:user.id},
            select:{note:true,createdAt:true,updatedAt:true}
        })
        if(notes.length===0 || currNote==null) return "You don't have notes yet";


        const formatedNote = (
            
            `
            Total Available Notes:${notes.length}
            User's Currently Opened Note:${currNote.note}
            Created At:${currNote.createdAt.toDateString()}
            Updated At:${currNote.updatedAt.toDateString()}
            `.trim()
        )

        // console.log(formatedNote)
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "developer",
        content: `
          You are a helpful assistant that answers questions about a user's notes. 
          Assume all questions are related to the user's notes. 
          Make sure that your answers are not too verbose and you speak succinctly. 
          Your responses MUST be formatted in clean, valid HTML with proper structure. 
          Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
          Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
          Avoid inline styles, JavaScript, or custom attributes and use of markdown syntax.
          
          Rendered like this in JSX:
          <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />
    
          Here are the user's notes:
          ${formatedNote}
          `,
      },
    ];

  for (let i = 0; i < newQuestion.length; i++) {
    messages.push({ "role": "user", "content": newQuestion[i] });
    if (response.length > i) {
      messages.push({ "role": "assistant", "content": response[i] });
    }
  }

  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3.1:free",
    messages,
  }); 
  console.log(completion.choices[0].message.content)
    return completion.choices[0].message.content || "I am sorry a problem has occured";


}