import { prisma } from '../src/db/prisma'
import { queue } from '../src/lib/queue'
import { QdrantClient } from '@qdrant/js-client-rest'
import 'dotenv/config'

async function reindex() {
  console.log('🔄 Connecting to Qdrant...')
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  })

  try {
    console.log('🗑️ Deleting old Qdrant collection...')
    await qdrant.deleteCollection('note_god_collection')
    console.log('✅ Old collection deleted.')
  } catch (error) {
    console.log('ℹ️ Collection does not exist or already cleaned.')
  }

  // Fetch all files across all users from database
  const files = await prisma.fileUploads.findMany()
  console.log(`📁 Found ${files.length} files across all users. Queueing...`)

  for (const file of files) {
    await queue.add('process-file', {
      fileName: file.fileName,
      filePath: file.fileUrl,
      userId: file.uploaderId, // Preserves the exact user ID for each file
    })
    console.log(`  ➕ Queued: ${file.fileName} for User ID: ${file.uploaderId}`)
  }

  console.log('\n🎉 All files successfully queued!')
  console.log('⚡ The worker service will process each file and generate new gemini-embedding-2 embeddings.')
  process.exit(0)
}

reindex().catch((err) => {
  console.error('❌ Re-indexing failed:', err)
  process.exit(1)
})
