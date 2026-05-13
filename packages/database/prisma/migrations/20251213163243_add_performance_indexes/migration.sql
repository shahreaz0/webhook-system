-- CreateIndex
CREATE INDEX "Message_status_createdAt_idx" ON "Message"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MessageDelivery_nextRetryAt_status_idx" ON "MessageDelivery"("nextRetryAt", "status");

-- CreateIndex
CREATE INDEX "Webhook_appUserId_disabled_idx" ON "Webhook"("appUserId", "disabled");

-- CreateIndex
CREATE INDEX "WebhookEventType_eventTypeId_webhookId_idx" ON "WebhookEventType"("eventTypeId", "webhookId");
