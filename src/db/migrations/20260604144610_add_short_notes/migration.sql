-- CreateTable
CREATE TABLE "ShortNotes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortNotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShortNotes" ADD CONSTRAINT "ShortNotes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
