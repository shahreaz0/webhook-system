/*
  Warnings:

  - The `status` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'RETRYING', 'SKIPPED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "status",
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Message_status_deliverAt_idx" ON "Message"("status", "deliverAt");
