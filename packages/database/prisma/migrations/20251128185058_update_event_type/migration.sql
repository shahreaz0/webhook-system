/*
  Warnings:

  - You are about to drop the column `orgId` on the `EventType` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "EventType_orgId_idx";

-- AlterTable
ALTER TABLE "EventType" DROP COLUMN "orgId",
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deprecated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "groupName" TEXT,
ALTER COLUMN "description" DROP NOT NULL;
