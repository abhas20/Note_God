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

const hfClient = new InferenceClient(process.env.NEXT_PUBLIC_HF_API_TOKEN!);
const HF_MODELS = {
  "flux-fast": "black-forest-labs/FLUX.1-schnell",
  "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
  "sdxl-turbo": "ByteDance/Hyper-SD",
  "lightning": "ByteDance/SDXL-Lightning",
};


type ModelKey = keyof typeof HF_MODELS;

interface ImgParameter {
  width: number;
  height: number;
  model: ModelKey;
}

function sanitizeFilename(name: string) {
  const s = name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_.]/g, "");
  return s || "visualisation";
}

function toBlobFromResult(result: any, defaultMime = "image/png"): Blob {
  // If it's already a Blob
  if (result instanceof Blob) return result;

  // ArrayBuffer
  if (result instanceof ArrayBuffer) return new Blob([result], { type: defaultMime });

  // TypedArray (Uint8Array etc.)
  // if (ArrayBuffer.isView(result)) return new Blob([result.buffer], { type: defaultMime });

  // Sometimes payload is { data: Uint8Array } or similar
  if (result && (result.data instanceof Uint8Array || ArrayBuffer.isView(result.data))) {
    const view = result.data;
    return new Blob([view.buffer || view], { type: defaultMime });
  }

  throw new Error("Unsupported image result type");
}

export default function Visualise() {
  const [parameter, setParameter] = useState<ImgParameter>({
    width: 512,
    height: 512,
    model: "sdxl",
  });

  const [prompt, setPrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previousUrlRef.current && previousUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
    };
  }, []);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a valid prompt");
      return;
    }

    setIsLoading(true);
    if (previousUrlRef.current && previousUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }
    setImageUrl(null);

    try {
      const result = await hfClient.textToImage({
        model: HF_MODELS[parameter.model],
        inputs: `Explain ${prompt} in a detailed and visually descriptive manner.`,
        parameters: {
          width: parameter.width,
          height: parameter.height,
          num_inference_steps: parameter.model==="lightning"? 5 : 25,
          negative_prompt: "blurry, low quality, deformed, distorted, disfigured",
        },
        provider: "hf-inference",
      });

      if (!result) throw new Error("Empty response from image API");
      console.log(result);

      const blob = toBlobFromResult(result, "image/png"); 
      const objUrl = URL.createObjectURL(blob);
      previousUrlRef.current = objUrl;
      setImageUrl(objUrl);

      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex flex-col space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="text-accent-foreground text-sm font-semibold">
          Generate Image 
        </h3>
      </div>

      <Input
        type="text"
        placeholder="Enter text to visualise (e.g., 'Photosynthesis cycle')"
        value={prompt}
        onChange={(e) => setPrompt((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerateImage();
          }
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Input
          type="number"
          placeholder="Width"
          value={parameter.width}
          onChange={(e) =>
            setParameter({
              ...parameter,
              width: Number((e.target as HTMLInputElement).value),
            })
          }
          className="Input"
        />
        <Input
          type="number"
          placeholder="Height"
          value={parameter.height}
          onChange={(e) =>
            setParameter({
              ...parameter,
              height: Number((e.target as HTMLInputElement).value),
            })
          }
          className="Input"
        />
        <div className="w-64">
          <Select
            value={parameter.model}
            onValueChange={(val) =>
              setParameter({
                ...parameter,
                model: val as ModelKey,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flux-fast">
                FLUX Schnell 
              </SelectItem>
              <SelectItem value="sdxl">SDXL Base</SelectItem>
              <SelectItem value="sdxl-turbo">SDXL Turbo</SelectItem>
              <SelectItem value="lightning">
                SDXL Lightning 
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground mt-2 text-xs">
            Using: {HF_MODELS[parameter.model]}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button onClick={handleGenerateImage} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>

        <Button
          disabled={!imageUrl}
          variant="outline"
          onClick={handleDownloadImage}
        >
          <DownloadIcon className="mr-2 h-4 w-4" /> Download
        </Button>
      </div>

      {/* Image Display Area */}
      <div
        className={`relative mt-4 flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm">Just hold your patience...</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated"
            className="h-auto max-w-full rounded-md object-contain shadow-lg"
          />
        ) : (
          <p className="text-sm text-gray-400">Enter a prompt to generate</p>
        )}
      </div>
    </div>
  );
}