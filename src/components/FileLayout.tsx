"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { FileText, Loader2, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { FileUploads } from "@prisma/client";
import { toast } from "sonner";

type Props = {
  files: FileUploads[];
  fetchFiles?: () => Promise<void>;
};

const FileLayout = ({ files, fetchFiles }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteFiles = async (file: FileUploads) => {
    setLoading(true);
    try {
      const response = await fetch("/api/delete-files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.fileName.substring(file.fileName.indexOf("/") + 1),
        }),
      });

      if (response.ok) {
        console.log(
          "File and vectors deleted successfully for file:",
          file.fileName,
        );
        toast.success("File deleted successfully");
        await fetchFiles?.();
      } else {
        const data = await response.json();
        console.log("Error in deleting file:", data.errorMessage);
        toast.error("Error in deleting file: " + data.errorMessage);
      }
    } catch (error) {
      console.log("File Cannot be deleted");
      toast.error("Error in deleting file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <Card
          key={file.id}
          className="group transition hover:shadow-md dark:hover:shadow-zinc-800"
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-muted rounded-md p-2 dark:bg-zinc-800">
                <FileText className="text-muted-foreground h-5 w-5" />
              </div>

              <div className="truncate">
                <p className="text-foreground truncate text-sm font-medium">
                  {file.fileName.substring(
                    file.fileName.indexOf("/") + 15,
                  )}{" "}
                </p>
              </div>
            </div>

            {/* Action */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0"
              onClick={async () => {
                await handleDeleteFiles(file);
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-600" />
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileLayout;
