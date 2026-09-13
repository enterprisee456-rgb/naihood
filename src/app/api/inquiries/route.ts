import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const inquirySchema = z.object({ listingId: z.string().min(1).max(100), name: z.string().trim().min(2).max(100), phone: z.string().trim().min(7).max(30), message: z.string().trim().min(5).max(2000) });

export async function POST(request: NextRequest) {
  const parsed = inquirySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please add your name, phone and message." }, { status: 400 });
  const input = parsed.data;
  const listing = await prisma.listing.findFirst({ where: { id: input.listingId, status: "ACTIVE" } });
  if (!listing) return NextResponse.json({ error: "That listing is no longer available." }, { status: 404 });
  const seeker = await prisma.user.upsert({ where: { phone: input.phone }, update: { name: input.name }, create: { phone: input.phone, name: input.name, role: "SEEKER" } });
  const inquiry = await prisma.inquiry.create({ data: { message: input.message, contactPhone: input.phone, seekerId: seeker.id, listingId: listing.id } });
  return NextResponse.json({ data: { id: inquiry.id } }, { status: 201 });
}