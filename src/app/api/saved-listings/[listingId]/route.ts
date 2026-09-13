import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Log in to save listings." }, { status: 401 });
  const { listingId } = await params;
  const listing = await prisma.listing.findFirst({ where: { id: listingId, status: "ACTIVE" }, select: { id: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  await prisma.savedListing.upsert({ where: { userId_listingId: { userId: session.sub, listingId } }, update: {}, create: { userId: session.sub, listingId } });
  return NextResponse.json({ saved: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Log in to manage saved listings." }, { status: 401 });
  const { listingId } = await params;
  await prisma.savedListing.deleteMany({ where: { userId: session.sub, listingId } });
  return NextResponse.json({ saved: false });
}
