import { deleteUserFile } from "@/action/rag";
import { getUser } from "@/auth/server";
import { deleteVectorData } from "@/lib/rag-utils";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {

  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 },
    );
  }

  const { fileId, fileName } = await req.json();
  const userId = user.id;

  try {
    const resVec = await deleteVectorData(fileName,userId);
    console.log(resVec);
    if (resVec?.status === "acknowledged") {
      console.log("Vector data deleted successfully for file:", fileName);
    }

    const resUserFile = await deleteUserFile(fileId);

    if (resUserFile?.errorMessage) {
      console.log("Error in file deleting", resUserFile.errorMessage);
      return NextResponse.json(
        { errorMessage: resUserFile.errorMessage },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error in deleting file and vectors:", error);
    return NextResponse.json(
      { errorMessage: "Error in deleting file and vectors" },
      { status: 500 },
    );
  }
}
