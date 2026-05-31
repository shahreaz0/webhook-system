/*
  Warnings:

  - You are about to drop the column `appUserId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `appUserId` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `secrets` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the `AppUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[subscriberId,url]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subscriberId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secret` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriberId` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AppUser" DROP CONSTRAINT "AppUser_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_appUserId_fkey";

-- DropIndex
DROP INDEX "Message_appUserId_idx";

-- DropIndex
DROP INDEX "Webhook_appUserId_disabled_idx";

-- DropIndex
DROP INDEX "Webhook_appUserId_idx";

-- DropIndex
DROP INDEX "Webhook_appUserId_url_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "appUserId",
ADD COLUMN     "subscriberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "appUserId",
DROP COLUMN "secrets",
ADD COLUMN     "secret" TEXT NOT NULL,
ADD COLUMN     "subscriberId" TEXT NOT NULL;

-- DropTable
DROP TABLE "AppUser";

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscriber_applicationId_idx" ON "Subscriber"("applicationId");

-- CreateIndex
CREATE INDEX "Subscriber_email_idx" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_applicationId_referenceId_key" ON "Subscriber"("applicationId", "referenceId");

-- CreateIndex
CREATE INDEX "Message_subscriberId_idx" ON "Message"("subscriberId");

-- CreateIndex
CREATE INDEX "Webhook_subscriberId_idx" ON "Webhook"("subscriberId");

-- CreateIndex
CREATE INDEX "Webhook_subscriberId_disabled_idx" ON "Webhook"("subscriberId", "disabled");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_subscriberId_url_key" ON "Webhook"("subscriberId", "url");

-- AddForeignKey
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
