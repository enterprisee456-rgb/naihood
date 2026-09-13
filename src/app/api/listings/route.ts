import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingQuerySchema } from "@/lib/listings";
import { z } from "zod";
import { getSessionUser, isProvider } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const parsed = listingQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid listing filters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const filters = parsed.data;
  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
      ...(filters.minPrice || filters.maxPrice
        ? { priceKes: { gte: filters.minPrice, lte: filters.maxPrice } }
        : {}),
      ...(filters.minBedrooms !== undefined ? { bedrooms: { gte: filters.minBedrooms } } : {}),
      ...(filters.minBathrooms !== undefined ? { bathrooms: { gte: filters.minBathrooms } } : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q } },
              { description: { contains: filters.q } },
              { location: { estate: { contains: filters.q } } },
              { location: { town: { contains: filters.q } } },
              { location: { county: { contains: filters.q } } },
            ],
          }
        : {}),
      location: {
        ...(filters.county ? { county: filters.county } : {}),
        ...(filters.town ? { town: filters.town } : {}),
        ...(filters.estate ? { estate: filters.estate } : {}),
      },
    },
    include: { location: true, owner: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: listings,
    meta: { count: listings.length, filters },
  });
}

const listingCreateSchema = z.object({
  name: z.string().trim().min(2).max(100), phone: z.string().trim().min(7).max(30), title: z.string().trim().min(5).max(160), description: z.string().trim().min(15).max(4000),
  type: z.enum(["RENT", "SALE"]), propertyType: z.enum(["APARTMENT", "HOUSE", "BED_SITTER", "STUDIO", "LAND", "COMMERCIAL"]), priceKes: z.coerce.number().int().positive().max(2_000_000_000), imageUrl: z.string().url().refine((value) => { const protocol = new URL(value).protocol; return protocol === "https:" || protocol === "http:"; }, "Image URL must use HTTP or HTTPS."),
  bedrooms: z.coerce.number().int().nonnegative().max(50).optional(), bathrooms: z.coerce.number().int().nonnegative().max(50).optional(), amenities: z.string().max(1000).default(""), county: z.string().trim().min(2).max(100), town: z.string().trim().min(2).max(100), estate: z.string().trim().min(2).max(100),
});

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Log in with a provider account to publish a listing." }, { status: 401 });
  if (!isProvider(session.role)) return NextResponse.json({ error: "Only landlord and agent accounts can publish listings." }, { status: 403 });
  const parsed = listingCreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete the required listing details." }, { status: 400 });
  const input = parsed.data;
  const location = await prisma.location.findFirst({ where: { county: input.county, town: input.town, estate: input.estate } }) ?? await prisma.location.create({ data: { county: input.county, town: input.town, estate: input.estate } });
  const listing = await prisma.listing.create({ data: { title: input.title, description: input.description, type: input.type, propertyType: input.propertyType, priceKes: input.priceKes, bedrooms: input.bedrooms, bathrooms: input.bathrooms, amenities: input.amenities, imageUrl: input.imageUrl, ownerId: session.sub, locationId: location.id } });
  const recentSearches = await prisma.recentSearch.findMany({ where: { OR: [{ county: "" }, { county: input.county }], AND: [{ OR: [{ town: "" }, { town: input.town }] }, { OR: [{ estate: "" }, { estate: input.estate }] }, { OR: [{ type: "" }, { type: input.type }] }, { OR: [{ propertyType: "" }, { propertyType: input.propertyType }] }] }, select: { userId: true } });
  const recipients = [...new Set(recentSearches.map((search) => search.userId).filter((userId) => userId !== session.sub))];
  if (recipients.length) await prisma.notification.createMany({ data: recipients.map((userId) => ({ userId, type: "NEW_MATCH", title: "A new home matches your search", body: `${listing.title} is now listed in ${input.town}.`, href: `/listings/${listing.id}` })) });
  return NextResponse.json({ data: listing }, { status: 201 });
}
