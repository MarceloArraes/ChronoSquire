/*
  Warnings:

  - You are about to drop the column `date` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TimeEntry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,companyId,startDateTime]` on the table `TimeEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDateTime` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_userId_fkey";

-- DropIndex
DROP INDEX "TimeEntry_date_idx";

-- DropIndex
DROP INDEX "TimeEntry_userId_companyId_date_startTime_key";

-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "entryDate" DATE NOT NULL,
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "TimeEntry_startDateTime_idx" ON "TimeEntry"("startDateTime");

-- CreateIndex
CREATE INDEX "TimeEntry_entryDate_idx" ON "TimeEntry"("entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_userId_companyId_startDateTime_key" ON "TimeEntry"("userId", "companyId", "startDateTime");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
