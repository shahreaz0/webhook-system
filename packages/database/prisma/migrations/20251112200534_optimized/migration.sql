/*
  Warnings:

  - You are about to drop the column `eventTypeId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `_ApplicationToEventType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[applicationId,userId]` on the table `AppUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicationId,name]` on the table `EventType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appUserId,url]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationId` to the `EventType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ApplicationToEventType" DROP CONSTRAINT "_ApplicationToEventType_A_fkey";

-- DropForeignKey
ALTER TABLE "_ApplicationToEventType" DROP CONSTRAINT "_ApplicationToEventType_B_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "eventTypeId";

-- AlterTable
ALTER TABLE "EventType" ADD COLUMN     "applicationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- DropTable
DROP TABLE "_ApplicationToEventType";

-- CreateIndex
CREATE INDEX "AppUser_applicationId_idx" ON "AppUser"("applicationId");

-- CreateIndex
CREATE INDEX "AppUser_email_idx" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_applicationId_userId_key" ON "AppUser"("applicationId", "userId");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_name_idx" ON "Application"("name");

-- CreateIndex
CREATE INDEX "EventType_webhookId_idx" ON "EventType"("webhookId");

-- CreateIndex
CREATE INDEX "EventType_orgId_idx" ON "EventType"("orgId");

-- CreateIndex
CREATE INDEX "EventType_applicationId_idx" ON "EventType"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_applicationId_name_key" ON "EventType"("applicationId", "name");

-- CreateIndex
CREATE INDEX "Message_eventTypeId_idx" ON "Message"("eventTypeId");

-- CreateIndex
CREATE INDEX "Message_appUserId_idx" ON "Message"("appUserId");

-- CreateIndex
CREATE INDEX "Message_deliverAt_idx" ON "Message"("deliverAt");

-- CreateIndex
CREATE INDEX "Message_status_deliverAt_idx" ON "Message"("status", "deliverAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Webhook_appUserId_idx" ON "Webhook"("appUserId");

-- CreateIndex
CREATE INDEX "Webhook_orgId_idx" ON "Webhook"("orgId");

-- CreateIndex
CREATE INDEX "Webhook_url_idx" ON "Webhook"("url");

-- CreateIndex
CREATE INDEX "Webhook_disabled_idx" ON "Webhook"("disabled");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_appUserId_url_key" ON "Webhook"("appUserId", "url");

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
