-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "accessible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isArea" BOOLEAN NOT NULL DEFAULT false;
