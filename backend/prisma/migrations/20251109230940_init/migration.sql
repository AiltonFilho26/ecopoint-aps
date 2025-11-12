/*
  Warnings:

  - The primary key for the `Point` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PointWaste` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WasteType` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "PointWaste" DROP CONSTRAINT "PointWaste_pointId_fkey";

-- DropForeignKey
ALTER TABLE "PointWaste" DROP CONSTRAINT "PointWaste_wasteTypeId_fkey";

-- AlterTable
ALTER TABLE "Point" DROP CONSTRAINT "Point_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Point_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Point_id_seq";

-- AlterTable
ALTER TABLE "PointWaste" DROP CONSTRAINT "PointWaste_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pointId" SET DATA TYPE TEXT,
ALTER COLUMN "wasteTypeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PointWaste_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PointWaste_id_seq";

-- AlterTable
ALTER TABLE "WasteType" DROP CONSTRAINT "WasteType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WasteType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WasteType_id_seq";

-- AddForeignKey
ALTER TABLE "PointWaste" ADD CONSTRAINT "PointWaste_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointWaste" ADD CONSTRAINT "PointWaste_wasteTypeId_fkey" FOREIGN KEY ("wasteTypeId") REFERENCES "WasteType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
