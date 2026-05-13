/*
  Warnings:

  - You are about to drop the column `webhookId` on the `EventType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventType" DROP CONSTRAINT "EventType_webhookId_fkey";

-- DropIndex
DROP INDEX "EventType_webhookId_idx";

-- AlterTable
ALTER TABLE "EventType" DROP COLUMN "webhookId";

-- CreateTable
CREATE TABLE "WebhookEventType" (
    "webhookId" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,

    CONSTRAINT "WebhookEventType_pkey" PRIMARY KEY ("webhookId","eventTypeId")
);

-- CreateIndex
CREATE INDEX "WebhookEventType_eventTypeId_idx" ON "WebhookEventType"("eventTypeId");

-- AddForeignKey
ALTER TABLE "WebhookEventType" ADD CONSTRAINT "WebhookEventType_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEventType" ADD CONSTRAINT "WebhookEventType_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
