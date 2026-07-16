import { Worker } from 'bullmq'
import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/auth/admin'
import { addToVectorEmbedding, pdfLoader, textSplitter } from '@/lib/rag-utils'
import { logger } from '@/lib/logger'
import 'dotenv/config'

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    logger.info(
      {
        event: 'FILE_PROCESS_START',
        jobId: job.id,
        fileName: job.data.fileName,
        filePath: job.data.filePath,
        userId: job.data.userId,
      },
      'Processing file upload job',
    )
    const { fileName, filePath, userId } = job.data
    const client = await createAdminClient()
    const { storage } = client

    const { data, error } = await storage.from('User_pdfs').download(filePath)
    if (error) {
      logger.error(
        {
          event: 'FILE_DOWNLOAD_FAILED',
          jobId: job.id,
          filePath,
          error,
        },
        'Error downloading file in worker',
      )
      throw error
    }

    const tempDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const tempFilePath = path.join(tempDir, path.basename(filePath))
    const fileBuffer = Buffer.from(await data.arrayBuffer())
    fs.writeFileSync(tempFilePath, fileBuffer)

    logger.info(
      {
        event: 'FILE_DOWNLOAD_SUCCESS',
        jobId: job.id,
        tempFilePath,
      },
      `File downloaded to temporary path: ${tempFilePath}`,
    )

    try {
      // Load the PDF document
      const documents = await pdfLoader(tempFilePath, userId)
      logger.info(
        {
          event: 'PDF_LOAD_SUCCESS',
          jobId: job.id,
          pageCount: documents.length,
        },
        `Loaded ${documents.length} document pages`,
      )

      // Split the document into text chunks
      const chunks = await textSplitter(documents)
      logger.info(
        {
          event: 'TEXT_SPLIT_SUCCESS',
          jobId: job.id,
          chunkCount: chunks.length,
        },
        `Created ${chunks.length} text chunks`,
      )

      // Add chunks to vector embedding store
      logger.info(
        {
          event: 'VECDB_ADD_START',
          jobId: job.id,
        },
        'Adding chunks to vector embedding store',
      )
      await addToVectorEmbedding(chunks)
      logger.info(
        {
          event: 'VECDB_ADD_SUCCESS',
          jobId: job.id,
        },
        'Chunks added to vector embedding store',
      )
    } catch (error) {
      logger.error(
        {
          event: 'VECDB_ADD_FAILED',
          jobId: job.id,
          error,
        },
        'Error in processing vector embeddings',
      )
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath)
      logger.info(
        {
          event: 'TEMP_FILE_CLEANUP',
          jobId: job.id,
          tempFilePath,
        },
        `Temporary file deleted: ${tempFilePath}`,
      )
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'redis', // Use 'localhost' (not using Docker )
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD || 'psswrd',
    },
  },
)
