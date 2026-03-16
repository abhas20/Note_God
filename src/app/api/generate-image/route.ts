// src/app/api/generate-image/route.ts
import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";

// Initialize the client on the server using your secure, hidden token
const hfClient = new InferenceClient(process.env.HF_API_TOKEN!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { model, prompt, width, height, num_inference_steps } = body;

    if (!prompt || !model) {
      return NextResponse.json({ error: "Missing prompt or model" }, { status: 400 });
    }

    // Make the secure server-to-server call
    const result = await hfClient.textToImage({
      model: model,
      inputs: prompt,
      parameters: {
        width: width,
        height: height,
        num_inference_steps: num_inference_steps,
        negative_prompt: "blurry, low quality, deformed, distorted, disfigured",
      },
      provider: "hf-inference",
    });

    if (!result) throw new Error("Empty response from Hugging Face");

    // Convert the result to an ArrayBuffer to send over HTTP
    const arrayBuffer = await result.arrayBuffer();

    // Send the raw image data back to the frontend
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": result.type || "image/png",
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error("HF API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image on server" },
      { status: 500 }
    );
  }
}