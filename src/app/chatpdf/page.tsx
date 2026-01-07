"use client";

import { fetchUserFiles, uploadFileToDB } from "@/action/rag";
import FileLayout from "@/components/FileLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUploads } from "@prisma/client";
import { Bot, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface IMessage {
  role: "user" | "assistant" | "system";
  content?: string;
  documents?: string[];
}

function ChatwithPdfpage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Pdffiles, setPdffiles] = useState<FileUploads[]>([]);

  const bottomEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      await fetchUserFiles().then(({ files, errorMessage }) => {
        if (errorMessage) {
          console.log("Error while fetching files", errorMessage);
          toast.error("Error fetching files: " + errorMessage);
        } else {
          setPdffiles(files);
        }
      });
    } catch (error) {
      console.log("An error occured while fetching files", error);
      toast.error("An error occured while fetching files");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { errorMessage } = await uploadFileToDB(file);
      if (errorMessage) {
        console.log("error while uploading file", errorMessage);
        toast.error("Error uploading file: " + errorMessage);
      } else {
        toast.success("File uploaded successfully");
        await fetchFiles();
      }
    } catch (error) {
      console.log("An Error occured while uploading", error);
      toast.error("An error occured while uploading the file");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: IMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/query-rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const res = await response.json();
      console.log(res);
      const assistantMessage: IMessage = {
        role: "assistant",
        content: res.answer.data,
        documents: res.answer.source,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.log("Error fetching RAG answer:", error);
      toast.error("Error getting answer from PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Chat with your PDF 📄
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>

          <ScrollArea className="bg-accent h-[400px] rounded-md border p-3">
            {messages.length === 0 ? (
              <p className="mt-20 text-center text-gray-400">
                No messages yet. Upload a PDF and start chatting!
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`my-2 max-w-[80%] rounded-xl p-4 ${
                    m.role === "user"
                      ? "ml-auto bg-blue-200 text-blue-900"
                      : m.role === "assistant"
                        ? "bg-gray-200 text-gray-900"
                        : "text-center text-sm text-gray-400"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <Bot className="mb-2" />
                  ) : (
                    <User className="mb-2" />
                  )}
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </div>
                  {m.documents && m.documents.length > 0 && (
                    <div className="mt-4 border-t border-gray-300/50 pt-3">
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        Sources:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.documents.map((doc: any, index: number) => (
                          <span
                            key={index}
                            className="rounded-md border border-gray-300 bg-white/60 px-2 py-1 text-xs text-gray-800 shadow-sm"
                          >
                            📄 Page {doc.metadata.loc.pageNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomEndRef} />
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask something about your PDF..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <FileLayout files={Pdffiles} fetchFiles={fetchFiles} />
        </CardFooter>
      </Card>
    </div>
  );
}

export default ChatwithPdfpage;
