/*
  Warnings:

  - You are about to drop the column `secrects` on the `Webhook` table. All the data in the column will be lost.
  - Added the required column `secrets` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "secrects",
ADD COLUMN     "secrets" TEXT NOT NULL;
