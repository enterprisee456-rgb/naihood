import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingQuerySchema } from "@/lib/listings";

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
