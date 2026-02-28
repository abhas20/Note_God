"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { DownloadIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { InferenceClient } from "@huggingface/inference";
import { generateImagePrompt } from "@/action/note";

const hfClient = new InferenceClient(process.env.NEXT_PUBLIC_HF_API_TOKEN!);

const HF_MODELS = {
  "flux-fast": "black-forest-labs/FLUX.1-schnell",
  "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
  "sdxl-turbo": "ByteDance/Hyper-SD",
  "lightning": "ByteDance/SDXL-Lightning",
};

type ModelKey = keyof typeof HF_MODELS;

interface VisualiseNotesProps {
    noteId: string;
}

function sanitizeFilename(name: string) {
  const s = name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_.]/g, "");
  return s || "visualisation";
}

function toBlobFromResult(result: any, defaultMime = "image/png"): Blob {
  // If it's already a Blob
  if (result instanceof Blob) return result;

  // ArrayBuffer
  if (result instanceof ArrayBuffer)
    return new Blob([result], { type: defaultMime });

  if (
    result &&
    (result.data instanceof Uint8Array || ArrayBuffer.isView(result.data))
  ) {
    const view = result.data;
    return new Blob([view.buffer || view], { type: defaultMime });
  }

  throw new Error("Unsupported image result type");
}



export default function VisualiseNotes({ noteId }: VisualiseNotesProps) {

    const [prompt, setPrompt] = useState<string>("");
    const [model, setModel] = useState<ModelKey>("sdxl");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>("");

    const handleGenerateImage = async()=>{
        setIsGenerating(true);
        setImageUrl("");
        try {
            const imgPrompt = await generateImagePrompt(noteId);
            if(!imgPrompt){
                toast.error("Failed to generate image prompt from note.");
                setIsGenerating(false);
                return;
            }
            setPrompt(imgPrompt);

            const response = await hfClient.textToImage({
                model: HF_MODELS[model],
                inputs: imgPrompt,
                parameters: {
                    guidance_scale: 7.5,
                    num_inference_steps: 50,
                },
                provider: "hf-inference",
            });
            
            const blob = toBlobFromResult(response);
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        }
        catch (error) {
            console.error("Image generation error:", error);
            toast.error("Failed to generate image. Please try again.");
        }
        finally {
            setIsGenerating(false);
        }
    }



  const handleDownloadImage = () => {
    if (!imageUrl) return;

    try {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `${sanitizeFilename(prompt)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

 return (
  <div className="mx-auto w-full max-w-5xl rounded-2xl border bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-lg dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visualise your Notes</h1>
        <p className="text-sm text-muted-foreground">
          Turn your written notes into stunning AI-generated visuals
        </p>
      </div>
      <Sparkles className="h-6 w-6 text-indigo-500" />
    </div>

    {/* Controls */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={model} onValueChange={(value) => setModel(value as ModelKey)}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="flux-fast">FLUX Fast (Best)</SelectItem>
          <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
          <SelectItem value="sdxl-turbo">SDXL Turbo (Fast)</SelectItem>
          <SelectItem value="lightning">SDXL Lightning (Ultra Fast)</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex flex-1 gap-3">
        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        <Button
          onClick={handleDownloadImage}
          disabled={!imageUrl}
          variant="outline"
          className="flex-1 border-dashed"
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>

    {/* Output */}
    <div className="relative mt-8 overflow-hidden rounded-xl border bg-muted/30 p-4">
      {isGenerating && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm">AI is crafting your visualisation…</p>
        </div>
      )}

      {!isGenerating && imageUrl && (
        <div className="animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Generated Visualisation</p>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {model.toUpperCase()}
            </span>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-white shadow-lg dark:bg-neutral-950">
            <img
              src={imageUrl}
              alt="Generated Visualisation"
              className="h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>
      )}

      {!isGenerating && !imageUrl && (
        <div className="flex min-h-[320px] flex-col items-center justify-center text-sm text-muted-foreground">
          <Sparkles className="mb-2 h-8 w-8 opacity-60" />
          <p>Click Generate to visualise your notes</p>
        </div>
      )}
    </div>
  </div>
);
}