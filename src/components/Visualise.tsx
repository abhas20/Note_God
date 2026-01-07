"use client";
import { usePollinationsImage } from "@pollinations/react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { DownloadIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImgParameter {
  width: number;
  height: number;
  model: "flux" | "kontext" | "turbo" | "gptimage";
  seed: number;
  nologo: boolean;
}

function Visualise() {
  const [parameter, setParameter] = useState<ImgParameter>({
    width: 500,
    height: 500,
    model: "flux",
    seed: 50,
    nologo: true,
  });

  const [promt, setPromt] = useState<string>("");
  const [text, setText] = useState<string>("Ask ai for help");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);

  const imageUrl = usePollinationsImage(text, {
    width: parameter.width,
    height: parameter.height,
    model: parameter.model || "flux",
    seed: parameter.seed || 50,
    nologo: parameter.nologo || true,
  });

  const handleGenerateImage = () => {
    setText(`Explain ${promt} with a diagram`);
    setIsDisabled(true);
    setShowMessage(true);

    setTimeout(() => {
      setIsDisabled(false);
      setShowMessage(false);
    }, 4000);
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    const safeUrl = encodeURIComponent(imageUrl);
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/download-image?url=${safeUrl}&filename=${encodeURIComponent(`${promt}.jpeg`)}`,
      );

      if (!response.ok) {
        console.error("Failed to download image");
        toast.error("Failed to download image", {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      const a = document.createElement("a");
      a.href = URL.createObjectURL(await response.blob());
      a.download = `${promt}.jpeg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href); // Clean up the URL object

      toast.success("Image downloaded successfully!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Error downloading image", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      <h3 className="text-accent-foreground text-sm font-semibold">
        Generate Image
      </h3>
      <Input
        type="text"
        placeholder="Enter a text to visualise"
        value={promt}
        onChange={(e) => setPromt(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
            setParameter({ ...parameter, width: Number(e.target.value) })
          }
          className="Input"
        />
        <Input
          type="number"
          placeholder="Height"
          value={parameter.height}
          onChange={(e) =>
            setParameter({ ...parameter, height: Number(e.target.value) })
          }
          className="Input"
        />
        <div className="w-64">
          <Select
            value={parameter.model}
            onValueChange={(val) =>
              setParameter({
                ...parameter,
                model: val as typeof parameter.model,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flux" defaultChecked={true}>
                Flux
              </SelectItem>
              <SelectItem value="kontext">Kontext</SelectItem>
              <SelectItem value="turbo">Turbo</SelectItem>
              <SelectItem value="gptimage">GPT Image</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground mt-4 text-sm">
            Selected: {parameter.model}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 space-x-2">
        <Button onClick={handleGenerateImage} disabled={isDisabled}>
          Generate
        </Button>

        <Button disabled={!imageUrl} onClick={handleDownloadImage}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              Download <DownloadIcon />
            </>
          )}
        </Button>
      </div>

      {showMessage && (
        <p className="text-sm font-medium text-green-600">
          <Loader2 className="animate-spin" />
          Generating...
        </p>
      )}
      <div
        className={`h-${parameter.height} w-${parameter.width} flex items-center justify-center align-middle`}
      >
        {imageUrl !== null ? <img src={imageUrl} /> : <p>Error in uploading</p>}
      </div>
    </div>
  );
}

export default Visualise;
