ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_seekerId_fkey";
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_listingId_fkey";
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;