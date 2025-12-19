import { deleteUserFile } from "@/action/rag";
import { deleteVectorData } from "@/lib/rag-utils";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req:NextRequest) {
    const {fileId,fileName} = await req.json();

    try {
        const resVec = await deleteVectorData(fileName);
        console.log(resVec);
        if(resVec?.status==="acknowledged"){
            console.log("Vector data deleted successfully for file:", fileName);
        }
        
        const resUserFile = await deleteUserFile(fileId);

        if(resUserFile?.errorMessage){
            console.log("Error in file deleting", resUserFile.errorMessage);
            return NextResponse.json({errorMessage:resUserFile.errorMessage}, {status:500});
        }

        return NextResponse.json({success:true}, {status:200});


    } catch (error) {
        console.log("Error in deleting file and vectors:", error);
        return NextResponse.json({errorMessage:"Error in deleting file and vectors"}, {status:500});
        
    }
}