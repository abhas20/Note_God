/*
  Warnings:

  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Messages" DROP CONSTRAINT "Messages_senderId_fkey";

-- DropTable
DROP TABLE "public"."Messages";
