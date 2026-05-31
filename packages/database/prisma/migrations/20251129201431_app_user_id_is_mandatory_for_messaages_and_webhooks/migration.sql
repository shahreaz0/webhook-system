/*
  Warnings:

  - Made the column `appUserId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `appUserId` on table `Webhook` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_appUserId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "appUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "appUserId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
