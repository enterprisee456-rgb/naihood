CREATE TYPE "ListingType" AS ENUM ('RENT', 'SALE');
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'BED_SITTER', 'STUDIO', 'LAND', 'COMMERCIAL');
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PAUSED', 'SOLD', 'RENTED');

ALTER TABLE "Listing" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Listing"
  ALTER COLUMN "type" TYPE "ListingType" USING "type"::"ListingType",
  ALTER COLUMN "propertyType" TYPE "PropertyType" USING "propertyType"::"PropertyType",
  ALTER COLUMN "status" TYPE "ListingStatus" USING "status"::"ListingStatus";

ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ListingStatus";
