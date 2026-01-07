"use server";
import { prisma } from "@/db/prisma";
import { queue } from "@/lib/queue";
import { handleError } from "@/lib/utils";
import { createClient, getUser } from "@/auth/server";

export const uploadFileToDB = async (file: File) => {
  if (!file) throw new Error("No file provided");
  try {
    const { storage } = await createClient();
    const user = await getUser();
    if (!user) throw new Error("you must be logged in to upload a file");
    if (file) {
      if (file.size > 18 * 1024 * 1024) {
        throw new Error("File size exceeds 18MB limit");
      }
      if (file.type !== "application/pdf") {
        throw new Error("Only PDF files are allowed");
      }
    }

    const timestamp = Date.now();
    const uniquePath = `${user.id}/${timestamp}-${file.name}`;

    const { data, error } = await storage
      .from("User_pdfs")
      .upload(uniquePath, file);

    if (error) {
      console.log("Error while uploading");
      throw error;
    }

    // console.log(data);

    const created = await prisma.fileUploads.create({
      data: {
        fileName: uniquePath,
        fileUrl: data?.path,
        uploader: { connect: { id: user.id } },
      },
    });

    // console.log(created);

    await queue.add("process-file", {
      fileName: created.fileName,
      filePath: created.fileUrl,
      userId: user.id,
    });

    return { created, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const fetchUserFiles = async () => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to view your files");
    const files = await prisma.fileUploads.findMany({
      where: {
        uploaderId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { files, errorMessage: null };
  } catch (error) {
    return {
      files: [],
      errorMessage:
        error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const deleteUserFile = async (fileId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to delete a file");
    const file = await prisma.fileUploads.findUnique({
      where: {
        id: fileId,
      },
    });
    if (!file) throw new Error("File not found");
    if (file.uploaderId !== user.id)
      throw new Error("You are not authorized to delete this file");
    const { storage } = await createClient();
    const { error } = await storage.from("User_pdfs").remove([file.fileName]);

    if (error) {
      console.log("Error in deleting from storage", error);
      throw error;
    }

    await prisma.fileUploads.delete({
      where: {
        id: fileId,
      },
    });

    return { success: true, errorMessage: null };
  } catch (error) {
    handleError(error);
  }
};
