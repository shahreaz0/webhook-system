-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "labels" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "headers" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "labels" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'POST',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Webhook';
