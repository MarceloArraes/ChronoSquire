/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `HourlyRate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,companyId,typeOfDay,isNightShift]` on the table `HourlyRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeOfDay` to the `HourlyRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "HourlyRate_userId_companyId_dayOfWeek_isNightShift_key";

-- AlterTable
ALTER TABLE "HourlyRate" DROP COLUMN "dayOfWeek",
ADD COLUMN     "typeOfDay" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "HourlyRate_userId_companyId_typeOfDay_isNightShift_key" ON "HourlyRate"("userId", "companyId", "typeOfDay", "isNightShift");
