import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import path from "path";
import {TaskType} from '@google/generative-ai';

dotenv.config();

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  // model: "text-embedding-004",
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY!,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
});

export const pdfLoader = async (filePath: string, userId:string) => {
  console.log("📄 Reading file from disk...");
  const dataBuffer = fs.readFileSync(filePath);
  const parser: PDFParse = new PDFParse({ data: dataBuffer });

  console.log("🧩 Parsing PDF structure...");

  const info = await parser.getInfo();
  const totalPages = info.total;

  const docs: Document[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const pageResult = await parser.getText({ partial: [i] });

    if (!pageResult.text.trim()) continue;

    docs.push(
      new Document({
        pageContent: pageResult.text,
        metadata: {
          source: filePath,
          userId: userId,
          fileName: path.basename(filePath),
          pdf_numpages: totalPages,
          loc: { pageNumber: i },
          type: "pdf",
        },
      }),
    );
  }

  await parser.destroy();

  return docs;
};

export const textSplitter = async (
  documents: Document[],
  chunkSize: number = 500,
  chunkOverlap: number = 200,
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
    separators: ["\n\n", "\n", " ", ""],
  });

  const docs = await splitter.splitDocuments(documents);
  return docs;
};

export const addToVectorEmbedding = async (docs: Document[]) => {
  try {
    console.log(`Attempting to add ${docs.length} chunks to Qdrant...`);

    if (!docs || docs.length === 0) {
      console.error("❌ No documents provided to insert!");
      return;
    }

    // ✅ Filter out empty or whitespace-only chunks
    const cleanDocs = docs.filter((doc) => doc.pageContent.trim().length > 20);
    console.log(`📦 Clean chunks after filtering: ${cleanDocs.length}`);

    const BATCH_SIZE = 10;
    let vectorStore: QdrantVectorStore | null = null;

    for (let i = 0; i < cleanDocs.length; i += BATCH_SIZE) {
      const batch = cleanDocs.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(cleanDocs.length / BATCH_SIZE);

      let retries = 3;
      while (retries > 0) {
        try {
          if (!vectorStore) {
            // Create collection on first batch
            vectorStore = await QdrantVectorStore.fromDocuments(
              batch,
              embeddings,
              {
                collectionName: "note_god_collection",
                url: process.env.QDRANT_URL || "http://localhost:6333",
                client: client,
              },
            );
          } else {
            await vectorStore.addDocuments(batch);
          }

          console.log(`✅ Batch ${batchNum}/${totalBatches} added`);
          break; // success, exit retry loop
        } catch (err) {
          retries--;
          console.warn(
            `⚠️ Batch ${batchNum} failed, retrying... (${retries} left)`,
          );
          await new Promise((res) => setTimeout(res, 1000));

          if (retries === 0) {
            console.error(
              `❌ Skipping batch ${batchNum} after 3 failed attempts`,
            );
          }
        }
      }

      await new Promise((res) => setTimeout(res, 700));
    }

    console.log("✅ All documents added successfully!");
  } catch (error) {
    console.error("❌ Failed to add documents to Qdrant:", error);
    throw error;
  }
};


export const queryVectorStore = async (query: string, userId:string) => {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || "http://localhost:6333",
  });


  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      collectionName: "note_god_collection",
      url: process.env.QDRANT_URL || "http://localhost:6333",
      client: client,
    },
  );

  console.log(`Searching for: "${query}" for ${userId}...`);

  const results = await vectorStore
    .asRetriever({
      k: 4,
      searchType: "mmr",
      searchKwargs: {
        fetchK: 10,
        lambda: 0.7,
      },
      filter:{
        must: [
          {
            key: "metadata.userId",
            match: {
              value: userId,
            },
          }
        ]
      }
    })
    .invoke(query);

  return results;
};

export const askQuestion = async (question: string,userId:string) => {
  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
    temperature: 0.4,
  });

  const results = await queryVectorStore(question,userId);

  if (!results.length) {
    return {
      data: "I am sorry, I couldn't find any relevant notes.",
      source: [],
    };
  }

  const context = results
    .map((doc, index) => `Context ${index + 1}:\n${doc.pageContent}`)
    .join("\n\n");
  const SYSTEM_PROMPT = `You are an AI assistant that helps users by answering questions based on the provided context from their personal notes. Use the context to provide accurate and relevant answers. If the context does not contain the answer, respond with "I'm sorry, I don't have that information."`;

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Context:\n${context}\n\nQuestion: ${question}`),
  ];
  console.log("🤖 Asking Gemini...");

  const response = await gemini.invoke(messages);
  return {
    data: response.content,
    source: results.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    })),
  };
};

export const deleteVectorData = async (fileName: string,userId:string) => {
  console.log("Deleting vectors for file:", fileName);

  try {
    const collectionName = "note_god_collection";

    const { status } = await client.delete(collectionName, {
      filter: {
        must: [
          {
            key: "metadata.fileName",
            match: {
              value: fileName,
            },
          },
          {
            key: "metadata.userId",
            match: {
              value: userId,
            },
          }
        ],
      },
    });

    console.log("✅ Vectors deleted successfully!");
    return { status };
  } catch (error) {
    console.log("Error in deleting:", error);
  }
};
