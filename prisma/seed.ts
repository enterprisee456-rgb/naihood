import { PrismaClient, ListingType, PropertyType } from "@prisma/client";

const prisma = new PrismaClient();

const listings = [
  {
    title: "Sunlit two-bedroom near Milimani market",
    description: "A secure, airy apartment with reliable water, parking, and quick access to Kitale town.",
    type: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    priceKes: 28000,
    bedrooms: 2,
    bathrooms: 2,
    amenities: "Parking,Water,Security",
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    county: "Trans-Nzoia",
    town: "Kitale",
    estate: "Milimani",
  },
  {
    title: "Modern family home in Milimani",
    description: "A spacious three-bedroom home on a quiet compound, ideal for a growing family or executive tenant.",
    type: ListingType.SALE,
    propertyType: PropertyType.HOUSE,
    priceKes: 12500000,
    bedrooms: 3,
    bathrooms: 3,
    amenities: "Garden,Parking,Borehole",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    county: "Trans-Nzoia",
    town: "Kitale",
    estate: "Milimani",
  },
  {
    title: "Bright bedsitter close to Township stage",
    description: "Affordable and well-lit bedsitter with tiled floors, prepaid power, and walking access to transport.",
    type: ListingType.RENT,
    propertyType: PropertyType.BED_SITTER,
    priceKes: 8500,
    bedrooms: 1,
    bathrooms: 1,
    amenities: "Water,Prepaid power",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    county: "Trans-Nzoia",
    town: "Kitale",
    estate: "Township",
  },
];

async function main() {
  const owner = await prisma.user.upsert({
    where: { phone: "+254700000001" },
    update: {},
    create: { phone: "+254700000001", name: "Naihood Homes", role: "AGENT" },
  });

  for (const item of listings) {
    const location = await prisma.location.upsert({
      where: { id: `${item.county}-${item.town}-${item.estate}` },
      update: {},
      create: { id: `${item.county}-${item.town}-${item.estate}`, county: item.county, town: item.town, estate: item.estate },
    });

    await prisma.listing.upsert({
      where: { id: `seed-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {
        title: item.title,
        description: item.description,
        type: item.type,
        propertyType: item.propertyType,
        priceKes: item.priceKes,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        amenities: item.amenities,
        imageUrl: item.imageUrl,
        ownerId: owner.id,
        locationId: location.id,
      },
      create: {
        id: `seed-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title: item.title,
        description: item.description,
        type: item.type,
        propertyType: item.propertyType,
        priceKes: item.priceKes,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        amenities: item.amenities,
        imageUrl: item.imageUrl,
        ownerId: owner.id,
        locationId: location.id,
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
