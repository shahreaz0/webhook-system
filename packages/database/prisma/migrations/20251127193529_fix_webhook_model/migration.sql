/*
  Warnings:

  - You are about to drop the column `eventId` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `Webhook` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Webhook_orgId_idx";

-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "eventId",
DROP COLUMN "orgId";
