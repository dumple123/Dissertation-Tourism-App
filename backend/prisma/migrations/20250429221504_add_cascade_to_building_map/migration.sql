-- DropForeignKey
ALTER TABLE "Building" DROP CONSTRAINT "Building_mapId_fkey";

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;
