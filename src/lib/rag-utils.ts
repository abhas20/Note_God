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

dotenv.config();

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY!,
});

export const pdfLoader = async (filePath: string) => {
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
  await QdrantVectorStore.fromDocuments(docs, embeddings, {
    collectionName: "note_god_collection",
    url: process.env.QDRANT_URL || "http://localhost:6333",
    client: client,
  });

  // await vectorStore.addDocuments(docs);
  console.log("✅ Documents added successfully!");
};

export const queryVectorStore = async (query: string) => {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || "http://localhost:6333",
  });

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      collectionName: "note_god_collection",
      url: process.env.QDRANT_URL || "http://localhost:6333",
      client: client,
    },
  );

  console.log(`Searching for: "${query}"...`);

  const results = await vectorStore
    .asRetriever({
      k: 4,
      searchType: "mmr",
      searchKwargs: {
        fetchK: 10,
        lambda: 0.7,
      },
    })
    .invoke(query);

  return results;
};

export const askQuestion = async (question: string) => {
  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
    temperature: 0.4,
  });

  const results = await queryVectorStore(question);

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

export const deleteVectorData = async (fileName: string) => {
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
        ],
      },
    });

    console.log("✅ Vectors deleted successfully!");
    return { status };
  } catch (error) {
    console.log("Error in deleting:", error);
  }
};
