'use client'

import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { FileText, Loader2, TrashIcon, Download } from 'lucide-react'
import { Button } from './ui/button'
import { FileUploads } from '@prisma/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getSignedPdfUrlAction } from '@/action/rag'

type Props = {
  files: FileUploads[]
  fetchFiles?: () => Promise<void>
  onSelectFile?: (file: FileUploads) => void
  activeFileId?: string
}

const FileLayout = ({
  files,
  fetchFiles,
  onSelectFile,
  activeFileId,
}: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDeleteFiles = async (file: FileUploads) => {
    setLoading(true)
    try {
      const response = await fetch('/api/delete-files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.fileName.substring(file.fileName.indexOf('/') + 1),
        }),
      })

      if (response.ok) {
        console.log(
          'File and vectors deleted successfully for file:',
          file.fileName,
        )
        toast.success('File deleted successfully')
        await fetchFiles?.()
      } else {
        const data = await response.json()
        console.log('Error in deleting file:', data.errorMessage)
        toast.error('Error in deleting file: ' + data.errorMessage)
      }
    } catch (error) {
      console.log('File Cannot be deleted', error)
      toast.error('Error in deleting file')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (file: FileUploads, e: React.MouseEvent) => {
    e.stopPropagation() // Don't select the card
    setDownloadingId(file.id)
    try {
      const res = await getSignedPdfUrlAction(file.id)
      if (res.errorMessage !== null) {
        toast.error('Error fetching file download link: ' + res.errorMessage)
      } else {
        const a = document.createElement('a')
        a.href = res.signedUrl
        a.download =
          file.fileName.substring(file.fileName.indexOf('/') + 15) ||
          'document.pdf'
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success('Download started')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to download file')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {files.map((file) => (
        <Card
          key={file.id}
          className={cn(
            'group cursor-pointer border-2 transition hover:shadow-md dark:hover:shadow-zinc-800',
            activeFileId === file.id
              ? 'border-indigo-500 bg-indigo-50/5 dark:bg-indigo-950/10'
              : 'border-transparent',
          )}
          onClick={() => onSelectFile?.(file)}
        >
          <CardContent className="flex min-w-0 items-center justify-between p-4">
            <div className="mr-2 flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
              <div className="bg-muted shrink-0 rounded-md p-2 dark:bg-zinc-800">
                <FileText className="text-muted-foreground h-5 w-5" />
              </div>

              <div className="min-w-0 truncate">
                <p className="text-foreground truncate text-sm font-medium">
                  {file.fileName.substring(
                    file.fileName.indexOf('/') + 15,
                  )}{' '}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Download */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-indigo-650 h-8 w-8 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                onClick={(e) => handleDownloadFile(file, e)}
                disabled={downloadingId === file.id}
                title="Download PDF"
              >
                {downloadingId === file.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-red-650 h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={async (e) => {
                  e.stopPropagation() // Don't trigger card selection
                  await handleDeleteFiles(file)
                }}
                disabled={loading}
                title="Delete PDF"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default FileLayout
