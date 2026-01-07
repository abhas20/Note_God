"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import gemini from "../../ai";

export const updateNoteAction = async (noteId: string, note: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("you must be logged in to update a note");
    await prisma.notes.update({
      where: { id: noteId },
      data: { note },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("you must be logged in to create a note");
    await prisma.notes.create({
      data: {
        id: noteId,
        authId: user.id,
        note: "",
      },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("you must be logged in to delete a note");
    await prisma.notes.delete({
      where: { id: noteId, authId: user.id },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// export const askAINoteAction = async (
//   newQuestion: string[],
//   response: string[],
//   noteId: string,
// ) => {
//   const user = await getUser();
//   if (!user) throw new Error("you must be logged in to ask ai questios");

//   const notesCount = await prisma.notes.count({
//     where: { authId: user.id },
//   });

//   const currNote = await prisma.notes.findFirst({
//     where: { id: noteId, authId: user.id },
//     select: { note: true, createdAt: true, updatedAt: true },
//   });
//   if (notesCount === 0 || !currNote) return "You don't have notes yet";

//   const formatedNote = `
//             Total Available Notes:${notesCount}
//             User's Currently Opened Note:${currNote.note}
//             Created At:${currNote.createdAt.toDateString()}
//             Updated At:${currNote.updatedAt.toDateString()}
//             `.trim();

//   // console.log(formatedNote)
//   const messages: ChatCompletionMessageParam[] = [
//     {
//       role: "developer",
//       content: `
//           You are a helpful assistant that answers questions about a user's notes.
//           Assume all questions are related to the user's notes.
//           Make sure that your answers are not too verbose and you speak succinctly.
//           Your responses MUST be formatted in clean, valid HTML with proper structure.
//           Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate.
//           Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph.
//           Avoid inline styles, JavaScript, or custom attributes and use of markdown syntax.

//           Rendered like this in JSX:
//           <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />

//           Here are the user's notes:
//           ${formatedNote}
//           `,
//     },
//   ];

//   for (let i = 0; i < newQuestion.length; i++) {
//     messages.push({ role: "user", content: newQuestion[i] });
//     if (response.length > i) {
//       messages.push({ role: "assistant", content: response[i] });
//     }
//   }

//     const completion = await openai.chat.completions.create({
//       model: "deepseek/deepseek-chat-v3.1:free",
//       messages,
//     });

//   //   console.log(completion.choices[0].message.content)
//   return completion.choices[0].message.content || "I am sorry a problem has occured";
// };

export const askAINoteAction = async (
  newQuestion: string[],
  response: string[],
  noteId: string,
) => {
  const user = await getUser();
  if (!user) throw new Error("you must be logged in to ask ai questios");

  const notesCount = await prisma.notes.count({
    where: { authId: user.id },
  });

  const currNote = await prisma.notes.findFirst({
    where: { id: noteId, authId: user.id },
    select: { note: true, createdAt: true, updatedAt: true },
  });
  if (notesCount === 0 || !currNote) return "You don't have notes yet";

  const formatedNote = `
                Total Available Notes:${notesCount}
                User's Currently Opened Note:${currNote.note}
                Created At:${currNote.createdAt.toDateString()}
                Updated At:${currNote.updatedAt.toDateString()}
                `.trim();

  const contents = [];

  for (let i = 0; i < response.length; i++) {
    if (newQuestion[i]) {
      contents.push({
        role: "user",
        parts: [{ text: newQuestion[i] }],
      });
    }

    contents.push({
      role: "model",
      parts: [{ text: response[i] }],
    });
  }

  const currentQuestion = newQuestion[newQuestion.length - 1];
  if (currentQuestion) {
    contents.push({
      role: "user",
      parts: [{ text: currentQuestion }],
    });
  }

  const systemMessage =
    `You are a helpful assistant that answers questions about a user's notes.
                        Assume all questions relate to the user's notes.
                        Be concise and accurate.

                        IMPORTANT:
                        - Respond ONLY in clean, valid HTML.
                        - Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <br>.
                        - Do NOT use markdown.
                        - Do NOT include scripts, styles, or attributes.

                        Here are the user's notes:
                        ${formatedNote}`.trim();

  try {
    const completion = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemMessage,
      },
      contents: contents,
    });

    return completion.text ?? "<p>Sorry, something went wrong.</p>";
  } catch (error) {
    console.log("AI Response error: ", error);
    return "<p>Sorry, the AI could not generate a response.</p>";
  }
};
