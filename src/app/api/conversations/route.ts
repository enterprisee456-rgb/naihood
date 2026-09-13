import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const data = await prisma.conversation.findMany({ where: { OR: [{ seekerId: session.sub }, { ownerId: session.sub }] }, include: { listing: { select: { id: true, title: true } }, seeker: { select: { id: true, name: true } }, owner: { select: { id: true, name: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const body = await request.json() as { listingId?: string; body?: string };
  if (!body.listingId || !body.body?.trim() || body.body.length > 2000) return NextResponse.json({ error: "Listing and message are required; messages must be under 2,000 characters." }, { status: 400 });
  const listing = await prisma.listing.findFirst({ where: { id: body.listingId, status: "ACTIVE" }, select: { id: true, ownerId: true, title: true } });
  if (!listing || listing.ownerId === session.sub) return NextResponse.json({ error: "That listing cannot start a conversation." }, { status: 400 });
  const conversation = await prisma.conversation.upsert({ where: { listingId_seekerId_ownerId: { listingId: listing.id, seekerId: session.sub, ownerId: listing.ownerId } }, update: {}, create: { listingId: listing.id, seekerId: session.sub, ownerId: listing.ownerId } });
  const message = await prisma.message.create({ data: { conversationId: conversation.id, senderId: session.sub, body: body.body.trim() } });
  await prisma.notification.create({ data: { userId: listing.ownerId, type: "MESSAGE", title: "New property message", body: `Someone sent a message about ${listing.title}.`, href: `/messages/${conversation.id}` } });
  return NextResponse.json({ data: { conversationId: conversation.id, message } }, { status: 201 });
}
