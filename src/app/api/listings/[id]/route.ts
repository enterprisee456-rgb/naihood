import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isProvider } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({ title: z.string().trim().min(5).optional(), description: z.string().trim().min(15).optional(), priceKes: z.coerce.number().int().positive().optional(), status: z.enum(["ACTIVE", "PAUSED", "SOLD", "RENTED"]).optional() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session || !isProvider(session.role)) return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  const { id } = await params;
  const listing = await prisma.listing.findFirst({ where: { id, ownerId: session.sub }, select: { id: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid listing update." }, { status: 400 });
  const updated = await prisma.listing.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: updated });
}
