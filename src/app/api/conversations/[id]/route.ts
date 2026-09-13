import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(); if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const { id } = await params;
  const conversation = await prisma.conversation.findFirst({ where: { id, OR: [{ seekerId: session.sub }, { ownerId: session.sub }] }, include: { listing: { select: { id: true, title: true } }, seeker: { select: { id: true, name: true } }, owner: { select: { id: true, name: true } }, messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } } } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  await prisma.message.updateMany({ where: { conversationId: id, senderId: { not: session.sub }, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json({ data: conversation });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(); if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const { id } = await params; const body = await request.json() as { body?: string };
  if (!body.body?.trim()) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  const conversation = await prisma.conversation.findFirst({ where: { id, OR: [{ seekerId: session.sub }, { ownerId: session.sub }] }, select: { id: true, seekerId: true, ownerId: true, listing: { select: { title: true } } } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const recipientId = conversation.seekerId === session.sub ? conversation.ownerId : conversation.seekerId;
  const message = await prisma.message.create({ data: { conversationId: id, senderId: session.sub, body: body.body.trim() } });
  await prisma.notification.create({ data: { userId: recipientId, type: "MESSAGE", title: "New message", body: `New message about ${conversation.listing.title}.`, href: `/messages/${id}` } });
  return NextResponse.json({ data: message }, { status: 201 });
}
