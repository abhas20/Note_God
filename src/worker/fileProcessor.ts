
import {Worker} from 'bullmq';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/auth/admin';
import { addToVectorEmbedding, pdfLoader, textSplitter } from '@/lib/rag-utils';
import "dotenv/config";

console.log(process.env.REDIS_HOST);

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("Processing file:", job.data);
    const { fileName, filePath, userId } = job.data;
    const client = await createAdminClient();
    const { storage } = client;

    const {data,error} = await storage.from("User_pdfs").download(filePath);
    console.log(data)
    if (error) {
        console.log("Error downloading file in worker:", error);
        throw error;
    }

    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, path.basename(filePath));
    const fileBuffer = Buffer.from(await data.arrayBuffer());
    fs.writeFileSync(tempFilePath, fileBuffer);

    console.log(`✅ File downloaded to ${tempFilePath}`);

    
    // Load the PDF document
    const documents = await pdfLoader(tempFilePath);
    console.log(`Loaded ${documents.length} document pages`);

    // Split the document into text chunks
    const chunks = await textSplitter(documents);
    console.log(`Created ${chunks.length} text chunks`);


    // Add chunks to vector embedding store
    console.log("---ADDING to VecDB---");
    await addToVectorEmbedding(chunks);
    console.log("✅ Chunks added to vector embedding store");

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    console.log(`🧹 Temporary file ${tempFilePath} deleted`);
    
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD || "psswrd",
    },
  },
);