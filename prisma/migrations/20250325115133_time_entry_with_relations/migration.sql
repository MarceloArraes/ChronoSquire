/*
  Warnings:

  - You are about to drop the column `breakTime` on the `TimeEntry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,companyId,date,startTime]` on the table `TimeEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TimeEntry_userId_date_startTime_endTime_key";

-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "breakTime",
ADD COLUMN     "breakMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "earnings" DECIMAL(10,2),
ADD COLUMN     "totalTime" DECIMAL(5,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "TimeEntry_userId_idx" ON "TimeEntry"("userId");

-- CreateIndex
CREATE INDEX "TimeEntry_companyId_idx" ON "TimeEntry"("companyId");

-- CreateIndex
CREATE INDEX "TimeEntry_date_idx" ON "TimeEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_userId_companyId_date_startTime_key" ON "TimeEntry"("userId", "companyId", "date", "startTime");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
