import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const {searchParams}=new URL(request.url);
    const url=searchParams.get("url");
    const filename=searchParams.get("filename") || "img.png";

    if(!url){
        return NextResponse.json({error:"No url provided"},{status:400})
    }

    try {
        const res=await fetch(url);
        if(!res.ok){
            console.error("error in fetching image");
        }
        const contentType= res.headers.get('content-type');
        const buffer=await res.arrayBuffer() // reads the image data as a raw binary buffer.
        if (!buffer) {
            return NextResponse.json({error:"Failed to fetch image data"},{status:500});
        }
        const nodeBuffer=Buffer.from(buffer); // Convert ArrayBuffer to Node.js Buffer

        return new NextResponse(nodeBuffer,{
            status:200,
            headers:{
                "Content-Type":contentType || "image/png",
                "Content-Disposition":`attachment; filename="${filename}"`
            }
        })

    } catch (error) {
        console.log(error);
    }
}