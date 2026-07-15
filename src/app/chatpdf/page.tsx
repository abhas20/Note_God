'use client'

import {
  fetchUserFiles,
  uploadFileToDB,
  getSignedPdfUrlAction,
} from '@/action/rag'
import FileLayout from '@/components/FileLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileUploads } from '@prisma/client'
import { Bot, User, Download, Loader2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface IMessage {
  role: 'user' | 'assistant' | 'system'
  content?: string
  documents?: string[]
}

function ChatwithPdfpage() {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [Pdffiles, setPdffiles] = useState<FileUploads[]>([])
  const [activeFile, setActiveFile] = useState<FileUploads | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false)
  const [mobileTab, setMobileTab] = useState<'chat' | 'pdf'>('chat')

  const bottomEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    bottomEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (activeFile) {
      const fetchSignedUrl = async (fileId: string) => {
        setLoadingPdf(true)
        try {
          const res = await getSignedPdfUrlAction(fileId)
          if (res.errorMessage !== null) {
            toast.error(res.errorMessage)
            setActiveFile(null)
          } else {
            setPdfUrl(res.signedUrl)
          }
        } catch (error) {
          logger.error({
            event: 'FETCH_SIGNED_URL_FAILED',
            fileId,
            error,
          }, 'Failed to fetch signed URL for PDF preview')
          toast.error('Failed to load PDF preview')
          setActiveFile(null)
        } finally {
          setLoadingPdf(false)
        }
      }
      fetchSignedUrl(activeFile.id)
    } else {
      setPdfUrl(null)
    }
  }, [activeFile])

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      await fetchUserFiles().then(({ files, errorMessage }) => {
        if (errorMessage) {
          // console.log('Error while fetching files', errorMessage)
          logger.error({
            event: 'FETCH_FILES_FAILED',
            errorMessage,
          }, 'Error while fetching files')
          
          toast.error('Error fetching files: ' + errorMessage)
        } else {
          setPdffiles(files)
          setActiveFile((curr) => {
            if (curr && !files.some((f) => f.id === curr.id)) {
              return null
            }
            return curr
          })
        }
      })
    } catch (error) {
      // console.log('An error occured while fetching files', error)
      logger.error({
        event: 'FETCH_FILES_FAILED',
        error,
      }, 'An error occured while fetching files')
      toast.error('An error occured while fetching files')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const { errorMessage } = await uploadFileToDB(file)
      if (errorMessage) {
        // console.log('error while uploading file', errorMessage)
        logger.error({
          event: 'UPLOAD_FILE_FAILED',
          errorMessage,
        }, 'Error while uploading file')
        toast.error('Error uploading file: ' + errorMessage)
      } else {
        toast.success('File uploaded successfully')
        await fetchFiles()
      }
    } catch (error) {
      // console.log('An Error occured while uploading', error)
      logger.error({
        event: 'UPLOAD_FILE_FAILED',
        error,
      }, 'An Error occured while uploading')
      toast.error('An error occured while uploading the file')
    } finally {
      setUploading(false)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage: IMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const response = await fetch('/api/query-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const res = await response.json()
      // console.log(res)
      const assistantMessage: IMessage = {
        role: 'assistant',
        content: res.answer.data,
        documents: res.answer.source,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // console.log('Error fetching RAG answer:', error)
      logger.error({
        event: 'RAG_QUERY_FAILED',
        error,
      }, 'Error fetching RAG answer')
      toast.error('Error getting answer from PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFile = (file: FileUploads) => {
    setActiveFile(file)
    setMobileTab('pdf')
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-8">
      {/* Mobile Tab Selector */}
      {activeFile && (
        <div className="relative mb-4 flex w-full max-w-2xl shrink-0 items-center rounded-lg border border-gray-200/50 bg-gray-100/50 p-1 shadow-xs lg:hidden dark:border-gray-800 dark:bg-gray-900/60">
          <button
            onClick={() => setMobileTab('chat')}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
              mobileTab === 'chat'
                ? 'font-bold text-black dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Chat 💬
            {mobileTab === 'chat' && (
              <motion.div
                layoutId="activeMobileTab"
                className="absolute inset-0 -z-10 rounded-md bg-white shadow-xs dark:bg-gray-800"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setMobileTab('pdf')}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
              mobileTab === 'pdf'
                ? 'font-bold text-black dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            PDF Preview 📄
            {mobileTab === 'pdf' && (
              <motion.div
                layoutId="activeMobileTab"
                className="absolute inset-0 -z-10 rounded-md bg-white shadow-xs dark:bg-gray-800"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      )}

      <div className="flex w-full max-w-7xl flex-col items-stretch justify-center gap-6 lg:flex-row">
        {/* Left column: PDF Preview */}
        {activeFile && (
          <Card
            className={`border-gray-250 min-h-[500px] flex-1 flex-col border shadow-xl lg:h-[80vh] dark:border-gray-800 ${
              mobileTab !== 'pdf' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
              <div className="mr-4 flex items-center gap-2 overflow-hidden">
                <CardTitle className="truncate text-lg font-bold">
                  Preview:{' '}
                  {activeFile.fileName.substring(
                    activeFile.fileName.indexOf('/') + 15,
                  )}
                </CardTitle>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* Download PDF button */}
                <Button
                  variant="outline3d"
                  size="sm"
                  className="flex h-8 items-center gap-1.5 px-3 text-xs"
                  onClick={() => {
                    if (pdfUrl) {
                      const a = document.createElement('a')
                      a.href = pdfUrl
                      a.download =
                        activeFile.fileName.substring(
                          activeFile.fileName.indexOf('/') + 15,
                        ) || 'document.pdf'
                      a.target = '_blank'
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      toast.success('Download started')
                    } else {
                      toast.error('Preview URL not loaded yet')
                    }
                  }}
                  disabled={loadingPdf}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  variant="destructive3d"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setActiveFile(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative min-h-[400px] flex-1 overflow-hidden bg-zinc-100 p-0 dark:bg-zinc-900">
              {loadingPdf ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#toolbar=1`}
                  className="h-full min-h-[400px] w-full border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Failed to load PDF preview.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Right column: RAG Chat Card */}
        <Card
          className={`border-gray-250 flex w-full flex-col border shadow-xl dark:border-gray-800 ${
            activeFile ? 'shrink-0 lg:w-[500px]' : 'mx-auto max-w-2xl'
          } ${activeFile && mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-center text-2xl font-bold">
              Chat with your PDF 📄
              {activeFile && (
                <span className="max-w-[150px] truncate rounded-full border border-indigo-200 px-2 py-0.5 text-xs font-normal text-indigo-500 dark:border-indigo-800">
                  {activeFile.fileName.substring(
                    activeFile.fileName.indexOf('/') + 15,
                  )}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  variant="threeD"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
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
                        m.role === 'user'
                          ? 'ml-auto bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                          : m.role === 'assistant'
                            ? 'bg-gray-200 text-gray-900 dark:bg-zinc-800 dark:text-zinc-200'
                            : 'text-center text-sm text-gray-400'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <Bot className="mb-2" />
                      ) : (
                        <User className="mb-2" />
                      )}
                      <div className="leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                      {m.documents && m.documents.length > 0 && (
                        <div className="mt-4 border-t border-gray-300/50 pt-3 dark:border-zinc-700">
                          <p className="mb-1 text-xs font-semibold text-gray-500">
                            Sources:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {m.documents.map((doc: any, index: number) => (
                              <span
                                key={index}
                                className="rounded-md border border-gray-300 bg-white/60 px-2 py-1 text-xs text-gray-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
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
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Ask something about your PDF..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                variant="threeD"
              >
                {loading ? 'Thinking...' : 'Send'}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex w-full flex-col items-stretch border-t pt-4">
            <div className="max-h-60 w-full overflow-y-auto pr-1">
              <FileLayout
                files={Pdffiles}
                fetchFiles={fetchFiles}
                onSelectFile={handleSelectFile}
                activeFileId={activeFile?.id}
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ChatwithPdfpage
