/*
  Warnings:

  - A unique constraint covering the columns `[userId,companyId,dayOfWeek,isNightShift]` on the table `HourlyRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `HourlyRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "HourlyRate_userId_dayOfWeek_isNightShift_key";

-- AlterTable
ALTER TABLE "HourlyRate" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "breakTime" TIME;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HourlyRate_userId_companyId_dayOfWeek_isNightShift_key" ON "HourlyRate"("userId", "companyId", "dayOfWeek", "isNightShift");

-- AddForeignKey
ALTER TABLE "HourlyRate" ADD CONSTRAINT "HourlyRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
