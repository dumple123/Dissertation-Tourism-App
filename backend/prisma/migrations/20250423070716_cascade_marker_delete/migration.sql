-- DropForeignKey
ALTER TABLE "InteriorMarker" DROP CONSTRAINT "InteriorMarker_buildingId_fkey";

-- AddForeignKey
ALTER TABLE "InteriorMarker" ADD CONSTRAINT "InteriorMarker_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
