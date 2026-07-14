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
    logger.info({ jobData: job.data }, 'Processing file')
    const { fileName, filePath, userId } = job.data
    const client = await createAdminClient()
    const { storage } = client

    const { data, error } = await storage.from('User_pdfs').download(filePath)
    if (error) {
      logger.error({ error }, 'Error downloading file in worker')
      throw error
    }

    const tempDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const tempFilePath = path.join(tempDir, path.basename(filePath))
    const fileBuffer = Buffer.from(await data.arrayBuffer())
    fs.writeFileSync(tempFilePath, fileBuffer)

    logger.info(`✅ File downloaded to ${tempFilePath}`)

    try {
      // Load the PDF document
      const documents = await pdfLoader(tempFilePath, userId)
      logger.info(`Loaded ${documents.length} document pages`)

      // Split the document into text chunks
      const chunks = await textSplitter(documents)
      logger.info(`Created ${chunks.length} text chunks`)

      // Add chunks to vector embedding store
      logger.info('---ADDING to VecDB---')
      await addToVectorEmbedding(chunks)
      logger.info('✅ Chunks added to vector embedding store')
    } catch (error) {
      logger.error({ error }, 'Error in processing vector embeddings')
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath)
      logger.info(`🧹 Temporary file ${tempFilePath} deleted`)
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
