/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `WorkSchedule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,typeOfDay]` on the table `WorkSchedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeOfDay` to the `WorkSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WorkSchedule_userId_dayOfWeek_key";

-- AlterTable
ALTER TABLE "WorkSchedule" DROP COLUMN "dayOfWeek",
ADD COLUMN     "typeOfDay" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_userId_typeOfDay_key" ON "WorkSchedule"("userId", "typeOfDay");
