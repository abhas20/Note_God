import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";

export default function NoteGeneratorScrap() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-center">
          Generate Notes from Web
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Notes from Top-Websites using AI</DialogTitle>
          <DialogDescription>
            Enter a topic to generate notes. You can save the generated notes
            for later use.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p>Preview: </p>
          <span className="mt-2 block text-sm text-gray-500">ahjab</span>
        </div>

        <div className="mt-auto flex cursor-text flex-col gap-2 rounded-lg border p-4">
          <Input
            placeholder="Write the topic to search web and generate auto notes"
            className="placeholder:text-muted-foreground border-background resize-none rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              minHeight: "0",
              lineHeight: "normal",
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
              }
            }}
          />

          <div className="flex items-end justify-end space-x-4 align-middle">
            <Button>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="text-background mr-2" />
                  Generate
                </>
              )}
            </Button>
            <Button>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
