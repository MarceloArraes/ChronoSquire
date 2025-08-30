/*
  Warnings:

  - The primary key for the `TimeEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "TimeEntry_startDateTime_idx";

-- AlterTable
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TimeEntry_id_seq";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timeZone" TEXT;
