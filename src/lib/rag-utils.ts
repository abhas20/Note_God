import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import fs from 'fs'
import { PDFParse } from 'pdf-parse'
import { QdrantClient } from '@qdrant/js-client-rest'
import { QdrantVectorStore } from '@langchain/qdrant'
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dotenv from 'dotenv'
import path from 'path'
import { TaskType } from '@google/generative-ai'
import { logger } from './logger'

dotenv.config()

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
})

const embeddings = new GoogleGenerativeAIEmbeddings({
  // model: "text-embedding-004",
  model: 'gemini-embedding-2',
  apiKey: process.env.GEMINI_API_KEY!,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
})

export const pdfLoader = async (filePath: string, userId: string) => {
  // console.log('📄 Reading file from disk...')
  logger.info({ filePath, userId }, 'Reading PDF file from disk...')
  const dataBuffer = fs.readFileSync(filePath)
  const parser: PDFParse = new PDFParse({ data: dataBuffer })

  // console.log('🧩 Parsing PDF structure...')
  logger.info({ filePath }, 'Parsing PDF structure...')

  const info = await parser.getInfo()
  const totalPages = info.total

  const docs: Document[] = []

  for (let i = 1; i <= totalPages; i++) {
    const pageResult = await parser.getText({ partial: [i] })

    if (!pageResult.text.trim()) continue

    docs.push(
      new Document({
        pageContent: pageResult.text,
        metadata: {
          source: filePath,
          userId: userId,
          fileName: path.basename(filePath),
          pdf_numpages: totalPages,
          loc: { pageNumber: i },
          type: 'pdf',
        },
      }),
    )
  }

  await parser.destroy()

  return docs
}

export const textSplitter = async (
  documents: Document[],
  chunkSize: number = 1000,
  chunkOverlap: number = 300,
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
    separators: ['\n\n', '\n', ' ', ''],
  })

  const docs = await splitter.splitDocuments(documents)
  return docs
}

export const addToVectorEmbedding = async (docs: Document[]) => {
  try {
    logger.info(
      { chunkCount: docs.length },
      'Attempting to add chunks to Qdrant...',
    )

    if (!docs || docs.length === 0) {
      logger.error('No documents provided to insert!')
      return
    }

    // Filter out empty or whitespace-only chunks to prevent embedding crashes
    const cleanDocs = docs.filter((doc) => doc.pageContent.trim().length > 20)

    logger.info(
      { cleanChunkCount: cleanDocs.length },
      'Clean chunks after filtering',
    )

    await QdrantVectorStore.fromDocuments(cleanDocs, embeddings, {
      collectionName: 'note_god_collection',
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      client: client,
    })

    logger.info(
      { event: 'ALL_DOCUMENTS_ADDED_SUCCESSFULLY' },
      'All documents added successfully!',
    )
  } catch (error) {
    logger.error(
      { event: 'ADD_DOCUMENTS_TO_QDRANT_FAILED', error },
      'Failed to add documents to Qdrant',
    )
    throw error
  }
}

export const queryVectorStore = async (query: string, userId: string) => {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  })

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      collectionName: 'note_god_collection',
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      client: client,
    },
  )

  // console.log(`Searching for: "${query}" for ${userId}...`)
  logger.info(
    {
      event: 'QUERY_VECTOR_STORE',
      query,
      userId,
    },
    `Searching for: "${query}" for user ${userId}...`,
  )

  const results = await vectorStore
    .asRetriever({
      k: 4,
      searchType: 'mmr',
      searchKwargs: {
        fetchK: 10,
        lambda: 0.7,
      },
      filter: {
        must: [
          {
            key: 'metadata.userId',
            match: {
              value: userId,
            },
          },
        ],
      },
    })
    .invoke(query)

  return results
}

export const askQuestion = async (question: string, userId: string) => {
  const gemini = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY!,
    temperature: 0.4,
  })

  let results: any[] = []
  try {
    results = await queryVectorStore(question, userId)
  } catch (err) {
    logger.warn(
      { err, userId, question },
      'Vector store query encountered an error or collection is empty, falling back to general knowledge.',
    )
    results = []
  }

  const hasContext = results && results.length > 0

  const context = hasContext
    ? results
        .map((doc, index) => `Context ${index + 1}:\n${doc.pageContent}`)
        .join('\n\n')
    : 'No relevant context found in uploaded notes.'

  const SYSTEM_PROMPT = `You are an intelligent, helpful AI assistant designed to answer user questions using their personal notes and uploaded documents as the primary source of truth, enriched with your own extensive knowledge.

Guidelines:
1. **Primary Source**: Always inspect the provided context first. If relevant information is present in the context, make sure to base your core answer on it.
2. **Supplement with General Knowledge**: You are encouraged to use your own knowledge to give a deeper, clearer, more comprehensive, and well-explained answer.
3. **Transparency**:
   - If NO relevant information is found in the provided context (or context is absent), clearly state upfront:
     "I couldn't find anything related to this in your uploaded notes, but based on my general knowledge:"
     and then provide a thorough, accurate answer.
   - If the context only partially answers the question or you are expanding on it, clearly distinguish between what comes from their notes and what additional insights or explanations you are providing from your own knowledge.
4. **Formatting**: Always format your response using clean, structured GitHub-flavored Markdown (use bold text, bullet points, headers (#, ##, ###), and code blocks where applicable) to ensure high readability.`

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Context:\n${context}\n\nQuestion: ${question}`),
  ]

  const response = await gemini.invoke(messages)
  const responseText =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  return {
    data: responseText,
    source: hasContext
      ? results.map((doc) => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata,
        }))
      : [],
  }
}

export const deleteVectorData = async (fileName: string, userId: string) => {
  // console.log('Deleting vectors for file:', fileName)
  logger.info({ fileName, userId }, 'Deleting vectors for file...')

  try {
    const collectionName = 'note_god_collection'

    const { status } = await client.delete(collectionName, {
      filter: {
        must: [
          {
            key: 'metadata.fileName',
            match: {
              value: fileName,
            },
          },
          {
            key: 'metadata.userId',
            match: {
              value: userId,
            },
          },
        ],
      },
    })

    // console.log('✅ Vectors deleted successfully!')
    logger.info({ fileName, userId }, 'Vectors deleted successfully!')
    return { status }
  } catch (error) {
    // console.log('Error in deleting:', error)
    logger.error(
      {
        event: 'DELETE_VECTORS_FAILED',
        fileName,
        userId,
        error,
      },
      'Error in deleting vectors',
    )
    throw error
  }
}
